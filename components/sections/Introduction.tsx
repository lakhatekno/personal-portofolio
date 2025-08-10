'use client';
// React Next Import
import { useEffect, useRef } from 'react';

// Material Import
import { Sailing } from '@mui/icons-material';

// Third Party Import
import gsap from 'gsap';

export default function Introduction() {
	const underlineRef = useRef<HTMLDivElement>(null!);
	const containerRef = useRef<HTMLDivElement>(null!);

	useEffect(() => {
		const underline = underlineRef.current;
		const container = containerRef.current;

		const handleMouseEnter = () => {
			gsap.fromTo(
        underline,
        { width: '0%', x: '0%' },
        { width: '100%', x: '0%', duration: 0.8, ease: 'bounce.out'}
      );
		};
    
    const handleMouseLeave = () => {
        gsap.to(
          underline,
          { width: '0%', x: '0%', duration: 0.4, ease: 'bounce.out' }
        );
    }

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    }
	}, []);


	return (
		<section className="flex mt-2 h-96 items-center justify-center">
			<div className="w-fit mx-auto flex flex-col items-start justify-center">
				<h1 className="text-5xl font-bold text-slate-100">
					Welcome Aboard <Sailing className="scale-150 text-cyan-500"></Sailing>
				</h1>
				<div 
          ref={containerRef}
          className="text-3xl text-slate-100 flex gap-2"
        >
					<p>I'm </p>
					<div className="w-fit flex flex-col">
						<h2 className="font-bold text-cyan-500">Lakha Tekno</h2>
						<div
              ref={underlineRef} 
              className="w-0 border-b-4 border-cyan-500 self-end -mt-0.5"
            ></div>
					</div>
				</div>
			</div>
		</section>
	);
}
