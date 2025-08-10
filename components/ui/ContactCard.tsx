import Link from 'next/link';

import { LuSquareArrowRight } from 'react-icons/lu';

type ContactCardProps = {
	icon: React.ReactNode;
	provider: string | null;
	link: string | null;
	contact: string;
};

export default function ContactCard({ icon, provider, link, contact }: ContactCardProps) {
	return (
		<div
			className="
      flex w-full md:w-fit items-center justify-between gap-4 p-4 
      border border-slate-100 bg-transparent backdrop-blur-lg rounded-lg 
      shadow-md lg:shadow-lg shadow-cyan-500/40 cursor-default"
		>
			<div className="flex items-center gap-4">
				<div className="text-2xl text-cyan-500">{icon}</div>
				<div className="flex flex-col">
					<h3 className="font-semibold text-slate-100">{provider}</h3>
					<p
						className="text-cyan-500 break-all"
						aria-label={`${provider} ${contact}`}
					>
						{contact}
					</p>
				</div>
			</div>
			<Link
				href={link ? link : '/'}
				className="
          justify-self-end text-cyan-500 break-all transition-all scale-150
          hover:scale-[1.75] hover:-rotate-12 hover:drop-shadow-sm hover:drop-shadow-cyan-500/50
        "
				target={link ? '_blank' : '_self'}
				rel="noopener noreferrer"
			>
				<LuSquareArrowRight />
			</Link>
		</div>
	);
}
