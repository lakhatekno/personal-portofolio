import Link from 'next/link';
import { TbBrandNextjs } from 'react-icons/tb';

export default function Footer() {
	return (
		<footer className="font-light text-slate-100 text-center h-32 flex items-center justify-center gap-1 cursor-default">
			<p>
				by{' '}
				<Link
					href={'https://linkedin.com/in/muhamad-islakha'}
					target="_blank"
					className="font-semibold hover:underline hover:text-cyan-500 transition-colors"
				>
					Lakha Tekno
				</Link>{' '}
				with
			</p>
			<span className="flex gap-1 items-center font-semibold">
				<TbBrandNextjs />
				NextJS
			</span>
		</footer>
	);
}
