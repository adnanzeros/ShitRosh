// FILE: src/components/ui/Reveal.js
"use client";
import { motion, useReducedMotion } from "framer-motion";

export default function Reveal({ children, delay = 0, y = 28, as = "div", ...rest }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} {...rest}>{children}</M>
  );
}