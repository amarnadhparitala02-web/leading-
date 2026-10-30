import AfterPlusTwo from "@/components/home/AfterPlusTwo";
import DiscoverColleges from "@/components/home/DiscoverColleges";
import { FinalCta, ForParents, HowWeHelp } from "@/components/home/HelpAndParents";
import HomeHero from "@/components/home/HomeHero";
import JourneyTimeline from "@/components/home/JourneyTimeline";
import PathCards from "@/components/home/PathCards";
import RankPanel from "@/components/home/RankPanel";
import StoriesPreview from "@/components/home/StoriesPreview";
import Ticker from "@/components/home/Ticker";
import Gallery from "@/components/Gallery";

// Story order follows the redesign plan: the moment after +2, the journey, the course paths,
// the rank checker and college discovery, real stories, how we help, parents, and a closing call to action.
export default function Home() {
  return (
    <>
      <HomeHero />
      <Ticker />
      <AfterPlusTwo />
      <JourneyTimeline />
      <PathCards />
      <section className="bg-[#d6f5ec] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <RankPanel />
            <DiscoverColleges />
          </div>
        </div>
      </section>
      <StoriesPreview />
      <HowWeHelp />
      <ForParents />
      <Gallery title="Life at Leading Light" />
      <FinalCta />
    </>
  );
}
