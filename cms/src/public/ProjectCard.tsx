import Link from 'next/link'
import type {Project} from '@/payload-types'
import {responsiveImage} from '@/lib/responsiveMedia'
import {categories} from '@/lib/publicSite'
export default function ProjectCard({project,priority=false}:{project:Pick<Project,'id'|'slug'|'title'|'cover'|'client'|'year'|'role'|'categories'>;priority?:boolean}){
 const cover=typeof project.cover==='object'?project.cover:null
 return <Link href={'/work/'+project.slug} className="project-card" data-track="project_open" data-project={project.slug}><div className="project-card__media">{cover?.url?<img src={cover.url} {...responsiveImage(cover)} sizes="(max-width: 700px) 100vw, 50vw" alt={cover.alt||project.title} width={cover.width||undefined} height={cover.height||undefined} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'}/>:<span className="project-card__blank">{project.client||'BAEV'}</span>}<span className="project-card__arrow" aria-hidden="true">↗</span></div><div className="project-card__meta"><h3>{project.title}</h3><span>{project.year}</span></div><p>{project.role||categories(project).join(' · ')}</p></Link>
}
