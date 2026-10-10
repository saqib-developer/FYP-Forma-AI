import { SettingContext } from '@/context/SettingContext';
import { THEMES, themeToCssVars, parseTheme } from '@/data/Theme';
import { ProjectType, ScreenConfigType } from '@/types/types';
import { GripVertical } from 'lucide-react';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import ScreenHandler from './ScreenHandler';
import { htmlWrapper } from '@/data/constants';

interface Props {
    x: number;
    y: number;
    setPanningEnabled: (enabled: boolean) => void;
    width: number;
    height: number;
    html: string | undefined;
    projectDetail: ProjectType | undefined;
    screen: ScreenConfigType
}

const ScreenFrame = ({x, y, setPanningEnabled, width, height, html, projectDetail, screen}: Props) => {

    const {settingDetails} = useContext(SettingContext)
    const themeObj = parseTheme(settingDetails?.theme ?? projectDetail?.theme);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [size, setSize] = useState({ width, height });

    useEffect(() => {
        setSize({ width, height });
    }, [width, height]);

    const htmlCode = htmlWrapper(themeObj, html);

    const measureIframeHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
        try {
            const doc = iframe.contentDocument;
            if (!doc) return;

            const headerH = 85;
            const htmlEl = doc.documentElement;
            const body = doc.body;

            const contentH = Math.max(
                htmlEl?.scrollHeight ?? 0,
                body?.scrollHeight ?? 0,
                htmlEl?.offsetHeight ?? 0,
                body?.offsetHeight ?? 0
            );

            const next = Math.min(Math.max(contentH + headerH, 160), 2000);

            setSize((s) =>
                Math.abs(s.height - next) > 2
                    ? { ...s, height: next }
                    : s
            );
        } catch {
                // if sandbox/origin blocks access, we can't measure
        }
    }, []);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const onLoad = () => {
            measureIframeHeight();

            // ✅ observe DOM changes inside iframe
            const doc = iframe.contentDocument;
            if (!doc) return;

            const observer = new MutationObserver(() => measureIframeHeight());
            observer.observe(doc.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
            });

            // ✅ re-check a few times for fonts/images/tailwind async layout
            const t1 = window.setTimeout(measureIframeHeight, 50);
            const t2 = window.setTimeout(measureIframeHeight, 200);
            const t3 = window.setTimeout(measureIframeHeight, 600);

            return () => {
                observer.disconnect();
                window.clearTimeout(t1);
                window.clearTimeout(t2);
                window.clearTimeout(t3);
            };
        };

        iframe.addEventListener("load", onLoad);
        window.addEventListener("resize", measureIframeHeight);

        return () => {
            iframe.removeEventListener("load", onLoad);
            window.removeEventListener("resize", measureIframeHeight);
        };
    }, [measureIframeHeight, htmlCode]);

  return (
    <Rnd
        default={{
            x,
            y,
            width,
            height
        }}
        size={size}
        dragHandleClassName='drag-handle'
        enableResizing={{
            bottomLeft: true,
            bottomRight: true,
            topLeft: true,
            topRight: true,
        }}

        onDragStart={() => setPanningEnabled(false)}
        onDragStop={() => setPanningEnabled(true)}
        onResizeStart={() => setPanningEnabled(false)}
        onResizeStop={(_, __, ref, ___, position) => {setPanningEnabled(true);
            setSize({
                width: ref?.offsetWidth,
                height: ref?.offsetHeight
            });
        }}
    >
        <div className="relative w-full h-full z-10">
            <ScreenHandler 
                screen={screen} 
                theme={themeObj} 
                iframeRef={iframeRef} 
                projectId={projectDetail?.projectId as string}
                projectVisualDescription={projectDetail?.projectVisualDescription as string}
            />
            <iframe 
                ref={iframeRef}
                className='w-full bg-white h-full rounded-2xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.15)] ring-1 ring-slate-200/60'
                sandbox='allow-same-origin allow-scripts'
                srcDoc={htmlCode}
            />
        </div>
    </Rnd>
  )
}

export default ScreenFrame