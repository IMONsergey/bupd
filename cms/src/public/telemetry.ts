export type PublicEvent='project_open'|'case_section_view'|'media_play'|'contact_start'|'contact_submit_success'|'contact_submit_error'|'journal_to_case'|'external_case_open'
export function track(name:PublicEvent,properties:Record<string,string|number>={}){
 if(typeof window==='undefined')return
 // Integration point: deliberately no network, cookies, form values or visitor identifiers.
 window.dispatchEvent(new CustomEvent('baev:analytics',{detail:{event:name,...properties}}))
}
