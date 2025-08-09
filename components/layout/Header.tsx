'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Menu } from '@mui/icons-material';

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const navLinks = [
		{ href: '/', name: 'Home' },
		{ href: '/projects', name: 'Projects' },
		{ href: '/games', name: 'Games' },
	];

	return (
		<header className="bg-transparent sticky top-2 z-50">
			<div
				className="
        w-[90%] md:w-fit rounded-lg bg-gradient-to-br from-white/40 to-white/30 backdrop-blur-lg drop-shadow-lg drop-shadow-black
        mx-auto px-4 md:px-12 py-3 md:h-16 flex items-center justify-between md:justify-center"
			>
				{/* Mobile Hamburger */}
				<button
					className="md:hidden p-2 rounded hover:bg-gray-100 self-end"
					onClick={() => setIsOpen(!isOpen)}
					aria-label="Toggle Menu"
				>
					<Menu />
				</button>

				{/* Desktop Nav */}
				<nav className="hidden md:flex gap-24">
					{navLinks.map(({ href, name }) => (
						<div
							className="text-lg font-bold hover:scale-[1.1] transition-all  bg-gradient-to-br from-purple-200 to-slate-100 bg-clip-text text-transparent"
						>
							<Link
								key={href}
								href={href}
							>
								{name}
							</Link>
						</div>
					))}
				</nav>
			</div>
		</header>
	);
}
