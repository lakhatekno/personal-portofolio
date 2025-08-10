import { EmojiPeople } from "@mui/icons-material";
import { LiaTelegram, LiaLinkedinIn } from "react-icons/lia";
import { SiGmail } from "react-icons/si";

import ContactCard from "../ui/ContactCard";

export default function Contact() {
	return (
		<section className="felx flex-col">
			<div className="text-3xl font-bold text-slate-100 flex gap-4 items-center justify-center">
				<EmojiPeople className="scale-150 text-cyan-500" />
				<h2>Reach Me</h2>
			</div>
      <div className="flex flex-col md:flex-row w-full lg:w-fit mx-auto items-center justify-center gap-4 mt-8">      
        <ContactCard
          icon={<SiGmail />}
          link={'mailto:lakhatekno2514@gmail.com'}
          provider={'Email'}
          contact="lakhatekno2514@gmail.com"
        />
        
        <ContactCard
          icon={<LiaLinkedinIn />}
          link={'https://linkedin.com/in/muhammad-islakha'}
          provider={'Linkedin'}
          contact="Muhammad Islakha"
        />

        <ContactCard
          icon={<LiaTelegram />}
          link={'https://t.me/@khaeeenya3'}
          provider={'Telegram'}
          contact="@khaeeenya3"
        />
      </div>
		</section>
	);
}
