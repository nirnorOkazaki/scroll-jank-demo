"use client";

import { useState,useRef } from "react";

import { useVirtualScroll } from "@/hooks/useVirtualScroll";

export default function CustomScrollbar() {
    const { y, targetY, maxScrollY, containerHeight } = useVirtualScroll();

    const scrollbarTrack = useRef<HTMLDivElement | null>(null);
    const scrollbarThumb = useRef<HTMLDivElement | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(0);
    const [dragStartScrollY, setDragStartScrollY] = useState(0);

    const updateScrollbar = () => {
        if (!scrollbarTrack.current || !scrollbarThumb.current) return;

        const scrollPercentage = maxScrollY.current > 0 ? y.current / maxScrollY.current : 0;
        const viewportPercentage = window.innerHeight / containerHeight.current;
        const thumbHeight = Math.max(viewportPercentage * 100, 5); // 最小高さ5%を設定
        const thumbPosition = scrollPercentage * (100 - thumbHeight);

        scrollbarThumb.current.style.height = `${thumbHeight}%`;
        scrollbarThumb.current.style.transform = `translateY(${thumbPosition}%)`;
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStartY(e.clientY);
        setDragStartScrollY(y.current);
        document.body.style.userSelect = 'none';
        e.preventDefault();
        e.stopPropagation();
    };

    const handleMouseClick = (e: React.MouseEvent) => {
        if(e.target === scrollbarThumb.current) return;
        const trackRect = scrollbarTrack.current!.getBoundingClientRect();
        const clickY = e.clientY - trackRect.top;
        const trackHeight = trackRect.height;
        const thumbHeight = scrollbarThumb.current!.offsetHeight;
        // クリック位置に基づいてスクロール位置を計算
        const clickPercentage = clickY / trackHeight;
        const maxThumbPosition = trackHeight - thumbHeight;
        const thumbPosition = Math.min(clickPercentage * trackHeight, maxThumbPosition);
        const scrollPercentage = thumbPosition / maxThumbPosition;
        //
        
    };

    return (
        <div className="custom-scrollbar">
            <div className="scrollbar-track" id="scrollbar-track" ref={scrollbarTrack}>
                <div className="scrollbar-thumb" id="scrollbar-thumb" ref={scrollbarThumb}></div>
            </div>
        </div>
    )
}