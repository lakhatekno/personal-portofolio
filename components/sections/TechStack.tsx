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
  TbBrandNextjs,
} from 'react-icons/tb';

import TechStackList from '../ui/TechStackList';

export default function TechStack() {
	return (
		<section className="flex flex-col">
			<div className="text-3xl font-bold text-slate-100 flex gap-4 items-center justify-center">
				<Gamepad className="scale-150 text-cyan-500 rotate-12" />
				<h2>Tools & Stacks</h2>
			</div>
			<div className='w-11/12 md:w-4/5 lg:w-1/2 mx-auto mt-12 grid grid-cols-3 space-y-12'>
				<TechStackList
					icon={<TbBrandReact />}
					name="React"
					colorClassName="hover:text-blue-400"
				/>
				<TechStackList
					icon={<TbBrandLaravel />}
					name="Laravel"
					colorClassName="hover:text-red-500"
				/>
        <TechStackList
					icon={<TbBrandAngularFilled />}
					name="Angular"
					colorClassName="hover:text-red-500"
				/>
        <TechStackList
					icon={<TbBrandNextjs />}
					name="Next"
					colorClassName="hover:text-slate-900"
				/>
				<TechStackList
					icon={<TbBrandTailwind />}
					name="Tailwind"
					colorClassName="hover:text-cyan-400"
				/>
				<TechStackList
					icon={<TbBrandGit />}
					name="Git"
					colorClassName="hover:text-orange-400"
				/>
				<TechStackList
					icon={<TbBrandFigma />}
					name="Figma"
					colorClassName="hover:text-pink-500"
				/>
				<TechStackList
					icon={<TbBrandTypescript />}
					name="TypeScript"
					colorClassName="hover:text-blue-300"
				/>
				<TechStackList
					icon={<TbBrandJavascript />}
					name="JavaScript"
					colorClassName="hover:text-yellow-400"
				/>
				<TechStackList
					icon={<TbBrandPython />}
					name="Python"
					colorClassName="hover:text-yellow-500"
				/>
			</div>
		</section>
	);
}
