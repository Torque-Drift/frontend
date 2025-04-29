"use client";
import React from "react";
import Card from "../Card";
import SectionTitle from "../SectionTitle";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
  className?: string;
  columns?: 1 | 2;
}

const FAQ: React.FC<FAQProps> = ({
  items,
  title = "Frequently Asked Questions",
  className = "",
  columns = 2
}) => {
  return (
    <section className={`mb-20 ${className}`}>
      <SectionTitle>{title}</SectionTitle>
      
      <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : ''} gap-6`}>
        {items.map((faq, i) => (
          <Card key={i}>
            <h4 className="text-xl font-bold mb-3 text-rose-500">{faq.q}</h4>
            <p className="text-cyan-300/80">{faq.a}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FAQ; 