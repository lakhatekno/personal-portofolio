import Link from 'next/link';
import { notFound } from 'next/navigation';

import ReactMarkdown from 'react-markdown';

import { LuSquareChevronLeft } from "react-icons/lu";

import { projectData } from '@/src/data/projects-data';
import StackBadge from '@/components/ui/StackBadge';

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>
};

export async function generateStaticParams() {
  return projectData.map((project) => ({
    id: project.id.toString(),
  }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  const project = projectData.find((p) => p.id === projectId);

  if (!project) {
    notFound();
  }

  return (
    <section className="min-h-svh flex flex-col items-center px-4 sm:px-8 md:px-16 lg:px-24 py-20 text-slate-100">
      <div className="w-full max-w-4xl">
        {/* Back to Projects Link */}
        <Link 
          href="/projects" 
          className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-all mb-8 group hover:drop-shadow-sm hover:drop-shadow-cyan-500/50"
        >
          <LuSquareChevronLeft className="scale-[1.5] transition-all group-hover:rotate-12" />
          <span className='font-bold text-xl'>Back to Projects</span>
        </Link>

        <article className="bg-slate-800 rounded-lg shadow-lg shadow-slate-900 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            {/* Header */}
            <header className="mb-6 border-b border-slate-700 pb-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-500 mb-2">
                {project.projectTitle}
              </h1>
              <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400">
                <p className="font-semibold">{project.companyName}</p>
                <time dateTime={project.projectDate}>{project.projectDate}</time>
              </div>
            </header>

            {/* Project Details */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">About the Project</h2>
              <div className="prose prose-slate prose-p:text-slate-100 prose-li:text-slate-100 max-w-none prose-h2:font-bold prose-h2:text-lg prose-headings:text-cyan-300 prose-strong:text-cyan-300">
                <ReactMarkdown>{project.projectDetail}</ReactMarkdown>
              </div>
            </section>

            {/* Tech Stack */}
            <section>
              <h2 className="text-2xl font-bold text-slate-100 mb-4">Technology Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStacks.map((stack: string, index: any) => (
                  <StackBadge key={index} stack={stack} />
                ))}
              </div>
            </section>
          </div>
        </article>
      </div>
    </section>
  );
}