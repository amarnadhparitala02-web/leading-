import AfterPlusTwo from "@/components/home/AfterPlusTwo";
import DiscoverColleges from "@/components/home/DiscoverColleges";
import { FinalCta, ForParents, HowWeHelp } from "@/components/home/HelpAndParents";
import HomeHero from "@/components/home/HomeHero";
import JourneyTimeline from "@/components/home/JourneyTimeline";
import PathCards from "@/components/home/PathCards";
import StoriesPreview from "@/components/home/StoriesPreview";
import TrustStrip from "@/components/home/TrustStrip";
import Gallery from "@/components/Gallery";

// Story order follows the redesign plan: the moment after +2, the journey, the course paths,
// the rank checker (in the hero) and college discovery, real stories, how we help, parents, and a closing call to action.
export default function Home() {
  return (
    <>
      <HomeHero />
      <TrustStrip />
      <AfterPlusTwo />
      <JourneyTimeline />
      <PathCards />
      <section className="bg-soft py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <DiscoverColleges />
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
