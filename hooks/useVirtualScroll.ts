import { useEffect, useRef } from "react";
import VirtualScroll from "virtual-scroll";

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

export const useVirtualScroll = () => {

    const y = useRef(0);
    const targetY = useRef(0);
    const maxScrollY = useRef(0);
    const containerHeight = useRef(0);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const container = document.querySelector('#container');
        const content = document.querySelector('#content');

        if (!container || !content) return;

        const scroller = new VirtualScroll({
            preventTouch: false,
            touchMultiplier: 3,
            mouseMultiplier: 0.5,
        });

        scroller.on((event) => {
            targetY.current = event ? targetY.current - event.deltaY : targetY.current;
            targetY.current = clamp(targetY.current, 0, maxScrollY.current);
        });

        const resize = () => {
            containerHeight.current = container.scrollHeight;
            maxScrollY.current = content.scrollHeight - window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        const update = () => {
            y.current = trunc3(lerp(y.current, targetY.current, 0.05));
            (content as HTMLElement).style.transform = `translateY(${-y.current}px)`;
            animationFrameId.current = requestAnimationFrame(update);
        }
        update();

        return () => {
            scroller.destroy();

            window.removeEventListener('resize', resize);
            
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        }
    }, []);

    return { y, targetY, maxScrollY, containerHeight };
};