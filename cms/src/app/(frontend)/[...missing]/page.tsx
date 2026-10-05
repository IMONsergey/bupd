import {notFound} from 'next/navigation'
export const metadata={title:'Страница не найдена — BAEV',robots:{index:false,follow:false}}
export default function MissingPage(){notFound()}
