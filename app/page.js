"use client";

import AfterPlusTwo from "@/components/home/AfterPlusTwo";
import DiscoverColleges from "@/components/home/DiscoverColleges";
import { FinalCta, ForParents } from "@/components/home/HelpAndParents";
import HomeHero from "@/components/home/HomeHero";
import JourneyTimeline from "@/components/home/JourneyTimeline";
import PathCards from "@/components/home/PathCards";
import TrustStrip from "@/components/home/TrustStrip";
import Gallery from "@/components/Gallery";
import { useSettings } from "@/components/SettingsProvider";

// Sections can be switched on or off by an admin (Settings > Homepage sections).
export default function Home() {
  const { settings: { sections: on } } = useSettings();
  return (
    <>
      <HomeHero />
      <TrustStrip />
      {on.afterPlusTwo && <AfterPlusTwo />}
      {on.journey && <JourneyTimeline />}
      {on.paths && <PathCards />}
      {on.colleges && (
        <section className="bg-soft py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <DiscoverColleges />
          </div>
        </section>
      )}
      {on.parents && <ForParents />}
      {on.gallery && <Gallery title="Life at Leading Light" />}
      <FinalCta />
    </>
  );
}
