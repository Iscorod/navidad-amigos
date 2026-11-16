import {NextResponse} from 'next/server';
import {readStore,updateStore,UserError} from '../../../lib/store';
export const dynamic='force-dynamic';
export async function GET(){try{const {data}=await readStore();return NextResponse.json(data,{headers:{'Cache-Control':'no-store'}})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Error de lectura'},{status:500})}}
export async function POST(req:Request){
 try{
  const a=await req.json();
  if(!a||!['add','rename','delete','set'].includes(a.type))return NextResponse.json({error:'Acción no válida'},{status:400});
  if(['add','rename'].includes(a.type)&& (typeof a.name!=='string'||!a.name.trim()||a.name.trim().length>40))return NextResponse.json({error:'Introduce un nombre de 1 a 40 caracteres'},{status:400});
  if(a.type!=='add'&&(typeof a.id!=='string'||a.id.length>100))return NextResponse.json({error:'ID no válido'},{status:400});
  if(a.type==='set'&&(!Number.isInteger(a.day)||a.day<1||a.day>31||![null,'free','busy'].includes(a.status)))return NextResponse.json({error:'Día o estado no válido'},{status:400});
  const data=await updateStore(a);return NextResponse.json(data,{headers:{'Cache-Control':'no-store'}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Error inesperado'},{status:e instanceof UserError?400:500})}
}
