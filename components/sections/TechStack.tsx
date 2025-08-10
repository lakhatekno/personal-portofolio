import { Gamepad } from '@mui/icons-material';
import { 
  TbBrandAngularFilled, 
  TbBrandReact, 
  TbBrandLaravel, 
  TbBrandTailwind, 
  TbBrandGit, 
  TbBrandFigma,
  TbBrandTypescript,
  TbBrandJavascript,
  TbBrandPython,
} from 'react-icons/tb';

import TechStackList from '../ui/TechStackList';

export default function TechStack() {
	return (
		<section className="flex flex-col">
			<div className="text-3xl font-bold text-slate-100 flex gap-4 items-center justify-center">
				<Gamepad className="scale-150 text-cyan-500 rotate-12" />
				<h2>Tools & Stacks</h2>
			</div>
			<div className='flex w-full flex-wrap gap-4 justify-center lg:justify-between mt-4'>
				<TechStackList
					icon={<TbBrandReact />}
					name="React"
					colorClassName="text-blue-400"
				/>
				<TechStackList
					icon={<TbBrandLaravel />}
					name="Laravel"
					colorClassName="text-red-500"
				/>
        <TechStackList
					icon={<TbBrandAngularFilled />}
					name="Angular"
					colorClassName="text-red-500"
				/>
				<TechStackList
					icon={<TbBrandTailwind />}
					name="Tailwind"
					colorClassName="text-cyan-400"
				/>
				<TechStackList
					icon={<TbBrandGit />}
					name="Git"
					colorClassName="text-orange-300"
				/>
				<TechStackList
					icon={<TbBrandFigma />}
					name="Figma"
					colorClassName="text-pink-500"
				/>
				<TechStackList
					icon={<TbBrandTypescript />}
					name="TypeScript"
					colorClassName="text-blue-300"
				/>
				<TechStackList
					icon={<TbBrandJavascript />}
					name="JavaScript"
					colorClassName="text-yellow-400"
				/>
				<TechStackList
					icon={<TbBrandPython />}
					name="Python"
					colorClassName="text-yellow-500"
				/>
			</div>
		</section>
	);
}
