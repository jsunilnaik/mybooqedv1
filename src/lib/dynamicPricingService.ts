import { salonService } from './dataService';
import type { TimeSlot } from '../types';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

/**
 * You are an advanced Revenue Optimization AI for a salon booking platform. 
 * Your goal is to maximize yield by applying dynamic "Happy Hour" pricing to unfilled appointment slots.
 */
const SYSTEM_PROMPT = `
You are the "Aura Revenue Architect" — an elite AI yield manager for high-end beauty salons. 
Your mission: Transform empty slots (Dead Zones) into high-value appointment opportunities.

STRATEGY RULES:
1. ANALYSIS: You will receive salon metadata (rating, top services) and a list of unbooked slots.
2. SELECTIVE DISCOUNTING: Only discount slow periods (Tue-Thu, 11 AM - 3 PM). 
3. VALUE-ADD UPSYELLING: Instead of deep discounts, prefer "Value-Add" hooks (e.g., "Free Scalp Massage" or "Premium Gold Mask Upgrade"). This protects the salon's luxury branding.
4. URGENCY LEVELS:
   - "Critical" (< 6 hours away): More aggressive discounts (20-30%) or high-value freebies.
   - "Strategic" (12-24 hours away): Gentle discounts (10-15%) + Value-Add.
   - "Future" (24h+): No discounts, only "Bundle Offers".
5. NO GO ZONES: NEVER discount weekends (Fri 5 PM - Sun) or slots already marked as "Booked".

OUTPUT SCHEMA (STRICT JSON ARRAY):
[
  {
    "slot_id": "string",
    "discount_percentage": number (0-30),
    "new_price": number,
    "value_add": "string (Optional: e.g. 'Free Deep Conditioning')",
    "marketing_hook": "string (Short, luxury-toned text for push notifications)",
    "estimated_revenue_boost": number (Estimated extra revenue in ₹ if this slot fills)
  }
]
`;

export const dynamicPricingService = {
  /**
   * Run the revenue optimizer for a specific salon.
   * This identifies dead zones and asks the AI for premium pricing strategies.
   */
  async runOptimizationCycle(salonId: string) {
    console.log(`[AI Revenue Command Center] Initiating advanced analysis for: ${salonId}`);
    
    const salon = salonService.getById(salonId);
    if (!salon) throw new Error("Salon not found");

    // Gather context
    const topServices = (salon.services || []).slice(0, 5).map(s => `${s.name} (₹${s.price})`);
    
    // 1. Gather slots for the next 48 hours
    const today = new Date();
    const dates = [
      today.toISOString().split('T')[0],
      new Date(today.getTime() + 86400000).toISOString().split('T')[0],
      new Date(today.getTime() + 172800000).toISOString().split('T')[0]
    ];

    const allSlots: TimeSlot[] = [];
    dates.forEach(date => {
      allSlots.push(...salonService.getSlots(salonId, date));
    });

    // 2. Filter for Dead Zones
    const availableSlots = allSlots.filter(s => !s.isBooked).slice(0, 12);

    const contextPayload = {
      salon_name: salon.name,
      rating: salon.rating,
      total_reviews: salon.totalReviews,
      base_services: topServices,
      upcoming_slots: availableSlots.map(s => ({
        slot_id: s.id,
        date: s.date,
        time: s.startTime,
        original_price: salon.startingPrice || 500
      }))
    };

    if (availableSlots.length === 0) {
      return { success: false, error: 'Target salon has high occupancy. No optimization needed.' };
    }

    try {
      console.log(`[AI Revenue Command Center] Consulting Aura Intelligence via ${OPENROUTER_MODEL}...`);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:5174/", 
          "X-Title": "Netrava Salon Command",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": OPENROUTER_MODEL,
          "messages": [
            { "role": "system", "content": SYSTEM_PROMPT },
            { "role": "user", "content": `Establish a high-yield strategy for this salon data:\n${JSON.stringify(contextPayload)}` }
          ],
          "temperature": 0.2
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "AI API Error");

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI returned empty strategy.");

      // Clean and Parse
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const recommendations: any[] = JSON.parse(jsonMatch ? jsonMatch[0] : content);

      // 3. Apply results
      salonService.clearAIDiscounts();
      let totalForecastBoost = 0;

      recommendations.forEach((rec: any) => {
        salonService.applyAISlotDiscount(
          rec.slot_id, 
          rec.discount_percentage, 
          rec.marketing_hook,
          rec.value_add
        );
        totalForecastBoost += (rec.estimated_revenue_boost || 0);
      });

      return {
        success: true,
        count: recommendations.length,
        forecastBoost: totalForecastBoost,
        recommendations
      };

    } catch (error) {
      console.error("[AI Revenue Command Center] Analysis failed:", error);
      return { success: false, error };
    }
  }
};
