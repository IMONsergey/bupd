import type {Field} from 'payload'
import {normalizeEmbedURL} from '../lib/caseEmbed'

export const caseEmbedFields:Field[]=[
  {name:'bodyMode',label:'Содержимое кейса',type:'select',defaultValue:'blocks',options:[{label:'Блоки Studio',value:'blocks'},{label:'Внешний кейс (iframe)',value:'embed'}]},
  {name:'embedURL',label:'Адрес внешнего кейса',type:'text',validate:(value:unknown)=>!value||Boolean(normalizeEmbedURL(value))||'Укажите публичный HTTPS-адрес страницы.'},
  {name:'embedHeight',label:'Высота на компьютере, px',type:'number',min:400,max:50000,defaultValue:6000},
  {name:'embedMobileHeight',label:'Высота на телефоне, px',type:'number',min:400,max:50000,defaultValue:9000},
  {name:'embedAutoHeight',label:'Автоматическая высота с кодом на исходном сайте',type:'checkbox',defaultValue:false},
]
