export type Status = 'free' | 'busy';
export type Person = { id:string; name:string; days:Record<string,Status> };
export type Data = { people:Person[] };
const env = () => {
  const token=process.env.GITHUB_TOKEN, owner=process.env.GITHUB_OWNER, repo=process.env.GITHUB_REPO;
  if(!token||!owner||!repo) throw new Error('Faltan variables GITHUB_TOKEN, GITHUB_OWNER o GITHUB_REPO');
  const path=(process.env.GITHUB_DATA_PATH||'data/disponibilidad.json').split('/').map(encodeURIComponent).join('/');
  const branch=process.env.GITHUB_BRANCH||'main';
  return {url:`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`,branch,token};
};
const headers=(token:string)=>({'Authorization':`Bearer ${token}`,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'});
export async function readStore():Promise<{data:Data;sha?:string}> {
  const {url,branch,token}=env();
  const res=await fetch(`${url}?ref=${encodeURIComponent(branch)}`,{headers:headers(token),cache:'no-store'});
  if(res.status===404) return {data:{people:[]}};
  if(!res.ok) throw new Error(`GitHub no permite leer los datos (${res.status})`);
  const file=await res.json();
  const raw=Buffer.from(String(file.content||'').replace(/\s/g,''),'base64').toString('utf8');
  const parsed=JSON.parse(raw);
  return {data:{people:Array.isArray(parsed.people)?parsed.people:[]},sha:file.sha};
}
export async function updateStore(action:{type:'add'|'rename'|'delete'|'set';id?:string;name?:string;day?:number;status?:Status}) {
  const {url,branch,token}=env();
  for(let attempt=0;attempt<5;attempt++) {
    const {data,sha}=await readStore();
    if(action.type==='add') {
      const name=action.name!.trim();
      if(data.people.some(p=>p.name.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'))) throw new UserError('Ese nombre ya existe. Puedes editarlo directamente en el calendario.');
      data.people.push({id:crypto.randomUUID(),name,days:{}});
    } else {
      const person=data.people.find(p=>p.id===action.id);
      if(!person) throw new UserError('La persona ya no existe. Actualiza el calendario.');
      if(action.type==='delete') data.people=data.people.filter(p=>p.id!==action.id);
      if(action.type==='rename') {
        const name=action.name!.trim();
        if(data.people.some(p=>p.id!==person.id&&p.name.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'))) throw new UserError('Ese nombre ya existe.');
        person.name=name;
      }
      if(action.type==='set') {
        const key=String(action.day);
        if(action.status) person.days[key]=action.status;
        else delete person.days[key];
      }
    }
    const body={message:`Calendario Navidad: ${action.type}`,content:Buffer.from(JSON.stringify(data,null,2)+'\n').toString('base64'),branch,...(sha?{sha}:{})};
    const res=await fetch(url,{method:'PUT',headers:headers(token),body:JSON.stringify(body),cache:'no-store'});
    if(res.ok) return data;
    if(res.status===409||res.status===422) continue;
    throw new Error(`No se pudo guardar en GitHub (${res.status})`);
  }
  throw new Error('Hubo cambios simultáneos. Inténtalo de nuevo.');
}
export class UserError extends Error {}
