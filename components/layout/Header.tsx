import Link from 'next/link';

export default function Header() {
	const navLinks = [
		{ href: '/', name: 'Home' },
		{ href: '/projects', name: 'Projects' },
		{ href: '/games', name: 'Games' },
	];

	return (
		<header className="bg-transparent sticky top-4 z-50 hidden lg:flex">
			<div
				className="
				backdrop-blur-3xl rounded-full overflow-hidden
        md:w-fit mx-auto px-4 md:px-24 py-3 md:h-16 flex items-center justify-between md:justify-center"
			>
				<nav className="flex gap-24">
					{navLinks.map(({ href, name }) => (
						<div
							key={href}
							className="text-lg font-bold hover:scale-[1.1] transition-all  bg-gradient-to-br from-cyan-100 via-blue-400 to-purple-500 bg-clip-text text-transparent"
						>
							<Link href={href}>{name}</Link>
						</div>
					))}
				</nav>
			</div>
		</header>
	);
}
