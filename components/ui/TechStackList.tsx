type TechStackListProps = {
	icon: React.ReactNode;
	name: string;
	colorClassName: string;
};

export default function TechStackList({ icon, name, colorClassName }: TechStackListProps) {
	return (
    <div className="w-full cursor-default">
      <li className={`flex flex-col justify-center items-center gap-4 text-slate-100 ${colorClassName} transition-colors`}>
        <div className="scale-[350%]">
          <p>
            {icon}
          </p>
        </div>
        <p className="text-base">{name}</p>
      </li>
    </div>
	);
}
