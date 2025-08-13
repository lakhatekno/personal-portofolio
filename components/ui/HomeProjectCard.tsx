import Image from 'next/image';
import StackBadge from './StackBadge';

type ProjectCardProps = {
	imgPath: string;
	projectTitle: string;
	projectDescription: string;
	techStacks: string[];
};

export default function HomeProjectCard({ imgPath, projectTitle, projectDescription, techStacks }: ProjectCardProps) {

	const displayImgPath =
    imgPath && imgPath.trim() !== ""
      ? imgPath
      : "/images/placeholder.png";

	return (
		<div className="flex flex-col rounded-lg overflow-hidden bg-slate-800 shadow-lg shadow-slate-900">
			{/* Image */}
			<div>
				<Image
					height={48}
					width={250}
					src={displayImgPath}
					alt={`${projectTitle} by Lakha Tekno`}
				></Image>
			</div>
			<div className='flex flex-col p-2.5 gap-2'>
				<h3 className='text-ellipsis line-clamp-1 font-bold text-base text-cyan-200'>{projectTitle}</h3>
				<p className='text-ellipsis line-clamp-3 font-light text-sm leading-none text-slate-100'>{projectDescription}</p>
				<div className='gap-1 flex flex-wrap mt-4'>
					{techStacks.map((stack, index) => (
						<StackBadge key={index} stack={stack} />
					))}
				</div>
			</div>
		</div>
	);
}
