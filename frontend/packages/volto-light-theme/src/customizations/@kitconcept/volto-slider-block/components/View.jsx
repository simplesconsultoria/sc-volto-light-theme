/**
 * OVERRIDE View.jsx
 * REASON: Forward the StyleWrapper `style` prop (theme CSS variables and
 * BorderWidget `--cardBorderWidth`/`--cardBorderColor`) to the slider root,
 * so the sc-vlt theme and border systems apply to the Slider block in view
 * and edit mode.
 * FILE: @kitconcept/volto-slider-block/src/components/View.jsx
 * FILE VERSION: 7.0.0-alpha.1
 */
import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import cx from 'classnames';
import Body from '@kitconcept/volto-slider-block/components/Body';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';
import {
  DotButton,
  NextButton,
  PrevButton,
} from '@kitconcept/volto-slider-block/components/DotsAndArrows';

const SliderView = (props) => {
  const {
    className,
    data,
    isEditMode = false,
    block,
    openObjectBrowser,
    onChangeBlock,
    slideIndex,
    setSlideIndex,
    style,
  } = props;

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const autoplay =
    data.autoplayEnabled !== undefined ? data.autoplayEnabled : false;
  const autoplayOptions = {
    delay: data.autoplayDelay,
    jump: data.autoplayJump,
  };
  const plugins = isEditMode ? [] : autoplay ? [Autoplay(autoplayOptions)] : [];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, plugins);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      setSlideIndex && setSlideIndex(selectedIndex - 1);
    }
  }, [emblaApi, selectedIndex, setSlideIndex]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      setSlideIndex && setSlideIndex(selectedIndex + 1);
    }
  }, [emblaApi, selectedIndex, setSlideIndex]);

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
        setSlideIndex && setSlideIndex(index);
      }
    },
    [emblaApi, setSlideIndex],
  );

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);

    // Upstream never unsubscribes; without this every re-run of the effect
    // (onInit/onSelect identity change, remount) stacks another listener.
    return () => {
      emblaApi.off('reInit', onInit);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  useEffect(() => {
    // This syncs the current slide with the objectwidget (or other sources
    // able to access the slider context)
    // that can modify the SliderContext (and come here via props slideIndex)
    if (isEditMode) {
      scrollTo(slideIndex);
    }
  }, [slideIndex, scrollTo, isEditMode]);

  const sliderContainerWidth = emblaApi
    ?.rootNode()
    .getBoundingClientRect().width;

  return (
    <>
      <div
        className={cx('block slider', data.variation || 'default', className)}
        style={{
          ...style,
          '--slider-container-width': `${sliderContainerWidth}px`,
        }}
      >
        {data.slides?.length > 0 && (
          <>
            <div className="slider-wrapper">
              {!data.hideArrows && data.slides?.length > 1 && (
                <>
                  <PrevButton onClick={scrollPrev} disabled={prevBtnDisabled} />
                  <NextButton onClick={scrollNext} disabled={nextBtnDisabled} />
                </>
              )}

              <div className="slider-viewport" ref={emblaRef}>
                <div className="slider-container">
                  {data.slides &&
                    data.slides.map((item, index) => {
                      return (
                        <div key={item['@id']} className="slider-slide">
                          <Body
                            {...props}
                            key={item['@id']}
                            data={item}
                            isEditMode={isEditMode}
                            dataBlock={data}
                            index={index}
                            block={block}
                            openObjectBrowser={openObjectBrowser}
                            onChangeBlock={onChangeBlock}
                            isActive={selectedIndex === index}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            {data.slides?.length > 1 && (
              <div className="slider-dots">
                {scrollSnaps.map((snap, index) => (
                  <DotButton
                    // Snap positions are unique, unlike a reused index.
                    key={snap}
                    index={index}
                    onClick={() => scrollTo(index)}
                    className={'slider-dot'.concat(
                      index === selectedIndex ? ' slider-dot--selected' : '',
                    )}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default withBlockExtensions(SliderView);
