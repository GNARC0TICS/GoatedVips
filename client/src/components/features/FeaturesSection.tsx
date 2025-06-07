import React from "react";
import { motion } from "framer-motion";
import { buttonStyles, cardStyles } from "@/lib/style-constants";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
