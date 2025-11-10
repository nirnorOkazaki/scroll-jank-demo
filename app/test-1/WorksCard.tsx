import Link from "next/link";

interface Props {
    item: {
        path:string,
        title:string,
        category:string[],
        image:string
    },
    handleClick: (setSelectedCategory: React.Dispatch<React.SetStateAction<string>>, cat: string) => void;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string>>
    convertCategoryText: (cat: string) => string;
}

export default function WorksCard({ item, handleClick, setSelectedCategory, convertCategoryText }: Props) {
    return (
        <div>
            {/* タイトル */}
            <Link href={item.path} className="flex items-end w-fit h-[min(69px,18.4vw)] md:h-[min(69px,4.791vw)]">
                <h3 className="font-zenKaku text-[min(14px,3.733vw)] md:text-[min(16px,1.111vw)] leading-[1.8em] md:leading-[1.75em] text-[#1a1a1a]">{item.title}</h3>
            </Link>
            {/* カテゴリ */}
            <div className="flex gap-[min(12px,3.2vw)] md:gap-[min(12px,0.833vw)] mt-[min(4px,1.066vw)] md:mt-[min(8px,0.555vw)]">
                {item.category.map((cat, idx) => (
                    <button key={idx} onClick={() => handleClick(setSelectedCategory, cat)}>
                        <p className="font-roboto text-[min(12px,3.2vw)] md:text-[min(12px,0.833vw)] leading-[1.75em] text-[#1a1a1a] hover:opacity-30">{convertCategoryText(cat)}</p>
                    </button>
                ))}
            </div>
            {/* 画像 */}
            <Link href={item.path} className="block w-full">
                <div className="w-full aspect-[4/3] mt-[min(16px,4.266vw)] md:mt-[min(18px,1.25vw)]">
                    <img className="sample-image w-full aspect-[4/3] opacity-0" data-src={item.image} src={item.image} alt="" />
                </div>
            </Link>
        </div>
    )
}