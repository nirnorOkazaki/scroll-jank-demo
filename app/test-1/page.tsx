"use client";

import { WebGL, Image } from "@/lib/WebGL";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
//
import VirtualScroll from "virtual-scroll";
//
import WorkListItem from "./WorksCard";

// 数値を指定された範囲内に制限するclamp関数
function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// 線形補間関数（慣性効果のため）
function lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
}

// 小数点以下3桁で切り捨てる
function trunc3(value: number): number {
    return Math.trunc(value * 1000) / 1000;
}

const handleClick = (setSelectedCategory: React.Dispatch<React.SetStateAction<string>>, selectedCategory: string) => {
    window.location.hash = selectedCategory;
    setSelectedCategory(selectedCategory);
}

export default function Test1() {


    const posts = data;
    const [selectedCategory, setSelectedCategory] = useState("all");

    let y = 0;
    let targetY = 0;
    let maxScrollY = 0;
    const lerpFactor = 0.05; // 慣性の強さ（0.05-0.2の範囲で調整）

    let isDragging = false;
    let dragStartY = 0;
    let dragStartScrollY = 0;

    const element = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // WEBGL
        const WEBGL = new WebGL(element.current);
        WEBGL.init();

        const IMAGE = new Image(WEBGL.scene, document.querySelectorAll('.sample-image'));
        IMAGE.init();

        const container = document.querySelector('#container');
        const content = document.querySelector('#content');

        const scrollbarThumb = document.getElementById('scrollbar-thumb') as HTMLElement;
        const scrollbarTrack = document.getElementById('scrollbar-track') as HTMLElement;

        // スクロールバーの位置とサイズを更新する関数
        const updateScrollbar = () => {
            const scrollPercentage = maxScrollY > 0 ? y / maxScrollY : 0;
            const viewportPercentage = window.innerHeight / container!.scrollHeight;
            const thumbHeight = Math.max(viewportPercentage * 100, 5); // 最小5%
            const thumbPosition = scrollPercentage * (100 - thumbHeight);

            scrollbarThumb.style.height = `${thumbHeight}%`;
            scrollbarThumb.style.transform = `translateY(${thumbPosition}vh)`;
        };

        // スクロールバーのドラッグ機能
        scrollbarThumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragStartY = e.clientY;
            dragStartScrollY = y;
            document.body.style.userSelect = 'none';
            e.preventDefault();
            e.stopPropagation(); // trackのクリックイベントを防ぐ
        });

        // スクロールバートラックのクリック機能
        scrollbarTrack.addEventListener('click', (e) => {
            // thumbクリック時は無視
            if (e.target === scrollbarThumb) return;

            const trackRect = scrollbarTrack.getBoundingClientRect();
            const clickY = e.clientY - trackRect.top;
            const trackHeight = trackRect.height;
            const thumbHeight = scrollbarThumb.offsetHeight;

            // クリック位置をスクロール位置に変換
            const clickPercentage = clickY / trackHeight;
            const maxThumbPosition = trackHeight - thumbHeight;
            const thumbPosition = Math.min(clickPercentage * trackHeight, maxThumbPosition);
            const scrollPercentage = thumbPosition / maxThumbPosition;

            targetY = scrollPercentage * maxScrollY;
            targetY = clamp(targetY, 0, maxScrollY);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaY = e.clientY - dragStartY;
            const scrollbarHeight = window.innerHeight;
            const thumbHeight = scrollbarThumb.offsetHeight;
            const maxThumbTravel = scrollbarHeight - thumbHeight;
            const scrollRatio = maxScrollY / maxThumbTravel;

            targetY = dragStartScrollY + (deltaY * scrollRatio);
            targetY = clamp(targetY, 0, maxScrollY);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.userSelect = '';
            }
        });

        const scroller = new VirtualScroll({ preventTouch: false, touchMultiplier: 3, mouseMultiplier: 0.5 });
        scroller.on((event) => {
            // スクロールイベントでは値の更新のみ行う
            targetY = event ? targetY - event.deltaY : targetY;
            targetY = clamp(targetY, 0, maxScrollY);
        });

        const resize = () => {
            //
            WEBGL.onResize();
            IMAGE.onResize();
            //
            maxScrollY = container!.scrollHeight - window.innerHeight;
            updateScrollbar();
        }
        resize();

        window.addEventListener("resize", resize);

        const update = () => {
            //
            
            // スクロールのオーバーライド処理をupdate関数内で実行（慣性付き）
            y = trunc3(lerp(y, targetY, lerpFactor));
            (content as HTMLElement)!.style.transform = `translateY(${-y}px)`;
            updateScrollbar();

            if (WEBGL.camera) {
                WEBGL.camera.position.y = -y;
            }

            WEBGL.onUpdate();
            IMAGE.onUpdate();

            requestAnimationFrame(update);
        }
        update();

    }, []);

    return (
        <>
            <div id="container" className="w-screen h-screen overflow-hidden">
                <div id="content">
                    <section className="mt-[min(160px,42.666vw)] md:mt-[min(360px,25vw)]">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-[min(74px,5.138vw)] w-[min(1248px,86.666vw)] mx-auto font-[Roboto]">
                            <h1 className="font-roboto text-[min(40px,10.666vw)] md:text-[min(60px,4.166vw)] leading-[1em]">Works</h1>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-[min(32px,2.222vw)] w-fit p-[min(24px,1.666vw)]">
                                <h3 className="mt-[0px] md:mt-[min(-5px,-0.347vw)] font-roboto text-[min(12px,3.2vw)] md:text-[min(12px,0.833vw)] leading-[1.75em] text-[#7e7e7e]">[ CATEGORY ]</h3>
                                {/* Navigation Menu */}
                                <ul className="relative flex flex-col md:flex-row items-start md:items-center gap-[min(16px,1.111vw)] z-[100]">
                                    <li>
                                        <button className="flex items-start gap-[min(4px,1.066vw)] md:gap-0 text-[min(13px,3.466vw)] md:text-[min(16px,1.111vw)] leading-[1.75em] hover:opacity-30">
                                            <p className={`${selectedCategory === "all" ? "underline decoration-solid decoration-[#1a1a1a]" : ""}`}>All</p>
                                            <span className="flex items-center text-[min(11px,2.933vw)] md:text-[min(12px,0.833vw)] h-[min(22px,5.866vw)] md:h-[min(32px,2.222vw)] mt-[min(2px,0.533vw)] md:mt-[min(2px,0.138vw)] ml-[min(4px,0.277vw)]">
                                                {posts.length}
                                            </span>
                                        </button>
                                    </li>
                                    {categories.map((category, index) => (
                                        <li key={index}>
                                            <button className="flex items-start gap-[min(4px,1.066vw)] md:gap-0 text-[min(13px,3.466vw)] md:text-[min(16px,1.111vw)] leading-[1.75em] hover:opacity-30 cursor-pointer" onClick={() => handleClick(setSelectedCategory, category.value)}>
                                                <p className={`${selectedCategory === category.value ? "underline decoration-solid decoration-[#1a1a1a]" : ""}`}>{category.label}</p>
                                                <span className="flex items-center text-[min(11px,2.933vw)] md:text-[min(12px,0.833vw)] h-[min(22px,5.866vw)] md:h-[min(32px,2.222vw)] mt-[min(2px,0.533vw)] md:mt-[min(2px,0.138vw)] ml-[min(4px,0.277vw)]">
                                                    10
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="mt-[min(24px,6.4vw)] md:mt-[min(160px,11.111vw)]">
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-y-[min(16px,4.266vw)] md:gap-y-[min(128px,8.888vw)] w-[min(327px,87.2vw)] md:w-[min(1248px,86.666vw)] mx-auto">
                    {posts.map((item, index) => (
                        <div className={`${selectedCategory === "all" || item.category.includes(selectedCategory) ? "opacity-100" : "absolute top-0 left-0 opacity-0 w-[0px] h-[0px] overflow-hidden pointer-events-none"}`} key={index}>
                            <WorkListItem
                                key={index}
                                item={item}
                                handleClick={handleClick}
                                setSelectedCategory={setSelectedCategory}
                                convertCategoryText={convertCategoryText}
                            />
                        </div>
                    ))}
                </ul>
            </section>
                </div>
            </div>

            <div className="custom-scrollbar">
                <div className="scrollbar-track" id="scrollbar-track">
                    <div className="scrollbar-thumb" id="scrollbar-thumb"></div>
                </div>
            </div>

            <div id="webgl-container" ref={element} className="fixed top-0 left-0 pointer-events-none"></div>
        </>
    )
}

const categories = [
    {
        label: "Art Direction",
        value: "artdirection"
    },
    {
        label: "Digital Contents",
        value: "digitalcontents"
    },
    {
        label: "Movie",
        value: "movie"
    },
    {
        label: "Graphic",
        value: "graphic"
    },
    {
        label: "Logo",
        value: "logo"
    }
]

const convertCategoryText = (category: string) => {
    switch (category) {
        case "graphic":
            return "# GRAPHIC";
        case "digitalcontents":
            return "# DIGITAL CONTENTS";
        case "artdirection":
            return "# ART DIRECTION";
        case "logo":
            return "# LOGO";
        case "movie":
            return "# MOVIE";
        default:
            return category;
    }
}

const data = [
    {
        "path": "/article/yanaiharaComeon",
        "date": "2023",
        "title": "柳原陽一郎 \"COME ON\"",
        "category": [
            "graphic",
            "artdirection"
        ],
        "image": "/images/Page/Works/yanaiharaComeon.png"
    },
    {
        "path": "/article/kazekaoruPetillant2022",
        "date": "2023",
        "title": "Brise d'été Pétillant\n風薫る (ペティアン) 2022",
        "category": [
            "graphic"
        ],
        "image": "/images/Page/Works/kazekaoruPetillant2022.png"
    },
    {
        "path": "/article/laprasSns",
        "title": "LAPRAS株式会社 SNS広告",
        "category": [
            "graphic"
        ],
        "image": "/images/Page/Works/laprasSns.png"
    },
    {
        "path": "/article/generationY1977",
        "title": "公益財団法人 現代芸術振興財団\nGeneration Y: 1977",
        "category": [
            "graphic"
        ],
        "image": "/images/Page/Works/generationY1977.png"
    },
    {
        "path": "/article/yukihiroDrumStick",
        "title": "L'Arc-en-Ciel \"yukihiro drum stick\"",
        "category": [
            "graphic"
        ],
        "image": "/images/Page/Works/yukihiroDrumStick.png"
    },
    {
        "path": "/article/kusanagikan",
        "title": "熱田神宮 剣の宝庫 草薙館",
        "category": [
            "graphic"
        ],
        "image": "/images/Page/Works/kusanagikan.png"
    },
    {
        "path": "/article/hydeNankaidentetsu",
        "title": "特急 HYDE サザン 南海電鉄",
        "category": [
            "graphic"
        ],
        "image": "/images/Page/Works/hydeNankaidentetsu.png"
    },
    {
        "path": "/article/unidotsLiveTour2021",
        "title": "UNIDOTS \"LIVE TOUR 2021 -まなざし-めぐるる-\"",
        "category": [
            "artdirection",
            "graphic"
        ],
        "image": "/images/Page/Works/unidotsLiveTour2021.png"
    },
    {
        "path": "/article/unidotsUniryouKaikin",
        "title": "UNIDOTS\n\"UNI漁解禁 First OneMan Live Archive\"",
        "category": [
            "digitalcontents"
        ],
        "image": "/images/Page/Works/unidotsUniryouKaikin.png"
    },
    {
        "path": "/article/toshioIezumi",
        "title": "Toshio Iezumi Glass Works",
        "category": [
            "digitalcontents"
        ],
        "image": "/images/Page/Works/toshioIezumi.png"
    },
    {
        "path": "/article/kurashikiGeijutuKagaku",
        "title": "倉敷芸術科学大学 芸術学部",
        "category": [
            "digitalcontents"
        ],
        "image": "/images/Page/Works/kurashikiGeijutuKagaku.png"
    },
    {
        "path": "/article/sumireHana",
        "title": "すみれ花店",
        "category": [
            "digitalcontents"
        ],
        "image": "/images/Page/Works/sumireHana.png"
    },
    {
        "path": "/article/kansaiPavilion",
        "title": "Future of Kansai",
        "category": [
            "digitalcontents"
        ],
        "image": "/images/Page/Works/kansaiPavilion.png"
    },
    {
        "path": "/article/lisleChocolat",
        "title": "L'isle Chocolat",
        "category": [
            "digitalcontents"
        ],
        "image": "/images/Page/Works/lisleChocolat.png"
    },
    {
        "path": "/article/laprasMemberPhoto",
        "title": "LAPRAS株式会社 メンバーフォト",
        "category": [
            "artdirection"
        ],
        "image": "/images/Page/Works/laprasMemberPhoto.png"
    },
    {
        "path": "/article/unidotsHukuzatuinshi",
        "title": "UNIDOTS \"複雑因子 -complex factor-\"",
        "category": [
            "artdirection",
            "graphic"
        ],
        "image": "/images/Page/Works/unidotsHukuzatuinshi.png"
    },
    {
        "path": "/article/hydeAcousticConcert2019",
        "title": "HYDE ACOUSTIC CONCERT 2019\n黑ミサ BIRTHDAY",
        "category": [
            "artdirection",
            "graphic"
        ],
        "image": "/images/Page/Works/hydeAcousticConcert2019.png"
    },
    {
        "path": "/article/reonaCalendar2022",
        "title": "ReoNa Calendar 2022",
        "category": [
            "artdirection",
            "graphic"
        ],
        "image": "/images/Page/Works/reonaCalendar2022.png"
    },
    {
        "path": "/article/yanaiharaGoodDays",
        "title": "柳原陽一郎 \"GOOD DAYS\"",
        "category": [
            "artdirection",
            "graphic"
        ],
        "image": "/images/Page/Works/yanaiharaGoodDays.png"
    },
    {
        "path": "/article/musashimurayama",
        "title": "武蔵村山市観光PR",
        "category": [
            "logo"
        ],
        "image": "/images/Page/Works/musashimurayama.png"
    },
    {
        "path": "/article/novelbright",
        "title": "Novelbright 愛結び",
        "category": [
            "logo"
        ],
        "image": "/images/Page/Works/novelbright.png"
    },
    {
        "path": "/article/acidAndroid",
        "title": "acid android (2010–2018)",
        "category": [
            "logo",
            "graphic"
        ],
        "image": "/images/Page/Works/acidAndroid.png"
    },
    {
        "path": "/article/picogramNetworks",
        "title": "picogram networks",
        "category": [
            "logo"
        ],
        "image": "/images/Page/Works/picogramNetworks.png"
    },
    {
        "path": "/article/e-to",
        "title": "e-to",
        "category": [
            "logo"
        ],
        "image": "/images/Page/Works/e-to.png"
    },
    {
        "path": "/article/yanaiharaSaiseijinta",
        "title": "柳原陽一郎「再生ジンタ」",
        "category": [
            "movie"
        ],
        "image": "/images/Page/Works/yanaiharaSaiseijinta.png"
    },
    {
        "path": "/article/unidotsBokuranoSyuutyakuten",
        "title": "UNIDOTS \"僕らの終着点\"",
        "category": [
            "movie",
            "logo"
        ],
        "image": "/images/Page/Works/unidotsBokuranoSyuutyakuten.png"
    },
    {
        "path": "/article/hamoKaitaiToZoukei",
        "title": "HAMO「解体と造形」",
        "category": [
            "movie",
            "logo"
        ],
        "image": "/images/Page/Works/hamoKaitaiToZoukei.png"
    },
    {
        "path": "/article/kashiwaDaisukeApril19",
        "title": "KASHIWA Daisuke \"april.#19\"",
        "category": [
            "movie"
        ],
        "image": "/images/Page/Works/kashiwaDaisukeApril19.png"
    },
    {
        "path": "/article/tsukiyoiNaked",
        "title": "月宵 TSUKIYOI「NAKED」",
        "category": [
            "movie"
        ],
        "image": "/images/Page/Works/tsukiyoiNaked.png"
    }
]