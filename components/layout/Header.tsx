import Link from 'next/link';

export default function Header() {
	const navLinks = [
		{ href: '/', name: 'Home' },
		{ href: '/projects', name: 'Projects' },
		{ href: 'https://github.com/lakhatekno', name: 'Github' },
		{ href: '/misc', name: 'Misc' },
	];

	return (
		<header className="bg-transparent sticky top-4 z-50 flex w-full">
			<div
				className="
        backdrop-blur-3xl rounded-full overflow-hidden
        w-full max-w-md md:max-w-none md:w-fit mx-auto px-6 md:px-24 py-3 md:h-16 
        flex items-center justify-center"
			>
				<nav className="flex gap-8 md:gap-16 lg:gap-24">
					{navLinks.map(({ href, name }) => (
						<div
							key={href}
							className="text-base md:text-lg font-bold hover:scale-[1.1] transition-all bg-gradient-to-br from-cyan-100 via-blue-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap"
						>
							<Link href={href}>{name}</Link>
						</div>
					))}
				</nav>
			</div>
		</header>
	);
}
