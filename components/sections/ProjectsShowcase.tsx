import { FaGear } from 'react-icons/fa6';
import { BsArrowRightCircle } from 'react-icons/bs';

import HomeProjectCard from '../ui/HomeProjectCard';

import { projectData } from '@/src/data/projects-data';
import Link from 'next/link';

type ProjectData = {
	id: number;
	imgPath: string;
	projectTitle: string;
	companyName: string;
	projectDate: string;
	projectDescription: string;
	projectDetail: string;
	techStacks: string[];
};

export default function ProjectsShowcase() {
	const projects: ProjectData[] = projectData;
	return (
		<section className="flex flex-col">
			<div className="text-3xl font-bold text-slate-100 flex gap-4 items-center justify-center">
				<FaGear className="scale-100 text-cyan-500" />
				<h2>Highlighted Projects</h2>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-8/12 mx-auto mt-8">
				{projects.map((project) => (
					<Link
						href={`/projects/${project.id}`}
						key={project.id}
						className="relative block rounded-lg bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 p-0.5 
             transition-all duration-300 ease-in-out hover:scale-[1.03] "
					>
						<HomeProjectCard
							projectTitle={project.projectTitle}
							projectDescription={project.projectDescription}
							techStacks={project.techStacks}
						/>
					</Link>
				))}
			</div>
			<div className="mt-8">
				<Link
					href={'/projects'}
					className="text-slate-100 px-6 py-2 mx-auto font-bold text-base rounded-full flex gap-4 w-fit items-center justify-center border border-cyan-500 hover:bg-slate-900 hover:scale-[1.1] transition-all"
				>
					See More Projects
					<BsArrowRightCircle className="scale-[1.5]" />
				</Link>
			</div>
		</section>
	);
}
