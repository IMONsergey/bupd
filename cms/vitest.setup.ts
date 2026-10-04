// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// jsdom has no viewport media query implementation; browser suites cover actual breakpoints.
if(typeof window.matchMedia!=='function')Object.defineProperty(window,'matchMedia',{writable:true,value:(media:string)=>({matches:false,media,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent(){return true}})})
