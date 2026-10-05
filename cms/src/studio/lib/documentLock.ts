import type {Payload} from 'payload'
const queues=new Map<string,Promise<unknown>>()
/** Serialize Studio mutations across instances. PG lock is held on a dedicated
 * connection while Payload completes its own transaction; no content is written here. */
export async function withDocumentLock<T>(payload:Payload,collection:string,id:string,run:()=>Promise<T>):Promise<T>{
 const key=collection+':'+id
 const pool=(payload.db as any).pool
 if(pool?.connect){const client=await pool.connect();try{await client.query('BEGIN');await client.query("SET LOCAL lock_timeout = '5s'");await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[key]);return await run()}finally{try{await client.query('ROLLBACK')}finally{client.release()}}}
 const previous=queues.get(key)||Promise.resolve();const next=previous.catch(()=>undefined).then(run);queues.set(key,next);try{return await next}finally{if(queues.get(key)===next)queues.delete(key)}
}
export const conflict=()=>Response.json({error:'Страница изменена в другой вкладке или другим редактором. Ваши правки сохранены в этой вкладке. Скопируйте нужное и перезагрузите страницу, чтобы сравнить версии.',code:'version_conflict'},{status:409})
export function versionMatches(expected:unknown,actual:string){return typeof expected==='string'&&expected===actual}
