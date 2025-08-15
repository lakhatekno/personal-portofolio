import Link from 'next/link';
import { projectData } from '@/src/data/projects-data';
import HomeProjectCard from '@/components/ui/HomeProjectCard'; // Make sure this path is correct

export default function Projects() {
  return (
    <main className="min-h-svh flex flex-col items-center px-4 sm:px-8 md:px-16 lg:px-24 py-20">
      <div className="w-full max-w-7xl">
        {/* Page Header */}
        <h1 className="text-5xl text-slate-100 font-extrabold mb-16 text-center">
          All <span className="text-cyan-500">Projects</span>
        </h1>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {projectData.map((project) => (
            <Link 
              href={`/projects/${project.id}`} 
              key={project.id} 
              className="transition-transform duration-300 ease-in-out hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg"
              aria-label={`View details for ${project.projectTitle}`}
            >
              <HomeProjectCard
                imgPath={project.imgPath}
                projectTitle={project.projectTitle}
                projectDescription={project.projectDescription}
                techStacks={project.techStacks}
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}