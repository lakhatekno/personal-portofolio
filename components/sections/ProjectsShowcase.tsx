import { FaGear } from 'react-icons/fa6';
import { BsArrowRightCircle } from "react-icons/bs";

import HomeProjectCard from '../ui/HomeProjectCard';

import { projectData } from '@/src/data/projects-data';
import Link from 'next/link';

type ProjectData = {
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
				{projects.map((project, index) => (
					<HomeProjectCard
						key={index}
						imgPath={project.imgPath}
						projectTitle={project.projectTitle}
						projectDescription={project.projectDescription}
						techStacks={project.techStacks}
					/>
				))}
			</div>
			<div className='mt-8'>
				<Link href={'/projects'} className='text-slate-100 px-8 py-4 mx-auto font-bold text-lg rounded-full flex gap-4 w-fit items-center justify-center border border-cyan-500 hover:bg-slate-900 hover:scale-[1.1] transition-all'>
					See More Projects
					<BsArrowRightCircle className='scale-[1.5]' />
				</Link>
			</div>
		</section>
	);
}
