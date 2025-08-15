'use client';

import { useState, MouseEvent, useRef } from 'react';
import gsap from 'gsap';

import StackBadge from './StackBadge';

type ProjectCardProps = {
	projectTitle: string;
	projectDescription: string;
	techStacks: string[];
};

export default function HomeProjectCard({ projectTitle, projectDescription, techStacks }: ProjectCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });

	const TILT_INTENSITY = 7;

	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
		const card = e.currentTarget;
		const { width, height, left, top } = card.getBoundingClientRect();

		const x = e.clientX - left;
		const y = e.clientY - top;
		const centerX = width / 2;
		const centerY = height / 2;

		const rotateY = (x - centerX) / TILT_INTENSITY;
		const rotateX = (centerY - y) / TILT_INTENSITY;

		setRotation({ rotateX, rotateY });
	};

	const handleMouseLeave = () => {
		gsap.to(cardRef.current, {
			rotationX: 0,
			rotationY: 0,
			duration: 0.8,
			ease: 'elastic.out(1, 0.75)',
			onComplete: () => {
				setRotation({ rotateX: 0, rotateY: 0 });
			},
		});
	};

	return (
		<div
			ref={cardRef}
			className="flex flex-col rounded-lg overflow-hidden bg-slate-800 shadow-lg shadow-slate-900 h-full"
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{
				transform: `perspective(1000px) rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg) scale3d(1, 1, 1)`,
				transition: 'transform 0.1s ease-out',
			}}
		>
			<div
				className="flex flex-col p-4 gap-2"
				style={{ transform: 'translateZ(20px)' }}
			>
				<h3 className="text-ellipsis line-clamp-1 font-bold text-base text-cyan-200">{projectTitle}</h3>
				<p className="text-ellipsis line-clamp-5 font-light text-sm leading-none text-slate-100">{projectDescription}</p>
				<p className="text-cyan-500 font-semibold underline">More...</p>
				<div className="gap-1 flex flex-wrap mt-4">
					{techStacks.map((stack, index) => (
						<StackBadge
							key={index}
							stack={stack}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
