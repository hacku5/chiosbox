"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface ContentBlock {
  section_key: string;
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  link_url: string;
}

export default function AboutPage() {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState<Record<string, ContentBlock>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content-blocks?section_key=about_hero,about_mission,about_story,about_team")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, ContentBlock> = {};
        for (const b of data.blocks || []) map[b.section_key] = b;
        setBlocks(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-mastic-white">
      <div className="pt-24 pb-16 px-6 lg:px-8">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="max-w-4xl mx-auto">

          {/* Hero */}
          <motion.div variants={item} className="text-center mb-16">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-deep-sea-teal">
              {blocks.about_hero?.title || t("about.title")}
            </h1>
            <p className="mt-4 text-deep-sea-teal/60 max-w-xl mx-auto leading-relaxed">
              {blocks.about_hero?.subtitle || t("about.subtitle")}
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div variants={item} className="bg-white rounded-2xl p-8 shadow-sm border border-deep-sea-teal/5 mb-8">
            <h2 className="font-display text-2xl font-bold text-deep-sea-teal mb-4">
              {blocks.about_mission?.title || t("about.missionTitle")}
            </h2>
            <p className="text-deep-sea-teal/60 leading-relaxed">
              {blocks.about_mission?.body || t("about.missionBody")}
            </p>
          </motion.div>

          {/* Story */}
          <motion.div variants={item} className="bg-white rounded-2xl p-8 shadow-sm border border-deep-sea-teal/5 mb-8">
            <h2 className="font-display text-2xl font-bold text-deep-sea-teal mb-4">
              {blocks.about_story?.title || t("about.storyTitle")}
            </h2>
            <p className="text-deep-sea-teal/60 leading-relaxed whitespace-pre-line">
              {blocks.about_story?.body || t("about.storyBody")}
            </p>
          </motion.div>

          {/* Team / CTA */}
          <motion.div variants={item} className="text-center p-8 bg-chios-purple rounded-2xl text-white shadow-lg shadow-chios-purple/20">
            <h2 className="font-display text-2xl font-bold">
              {blocks.about_team?.title || t("about.teamTitle")}
            </h2>
            <p className="mt-2 text-white/70">
              {blocks.about_team?.subtitle || t("about.teamSubtitle")}
            </p>
          </motion.div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12 text-deep-sea-teal/30">{t("common.loading")}</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
