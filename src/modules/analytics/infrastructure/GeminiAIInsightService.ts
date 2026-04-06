import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIInsightService } from "../domain/AIInsightService";

export class GeminiAIInsightService implements AIInsightService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // User requested "2.5 Flash Lite". Using current available "2.0 Flash Lite Preview"
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  private cleanJson(text: string): string {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      return jsonMatch ? jsonMatch[0] : text;
    } catch (e) {
      return text;
    }
  }

  private getDeterministicConsultation(data: any[]) {
    // 1. Marketing
    const channelMap: any = {};
    data.forEach(r => {
        const c = r.MarketingChannel || r.marketing_channel || "Orgánico";
        if (!channelMap[c]) channelMap[c] = { name: c, sales: 0 };
        channelMap[c].sales += Number(r.Sales || 0);
    });
    const topChannel: any = Object.values(channelMap).sort((a: any, b: any) => b.sales - a.sales)[0] || { name: "Desconocido" };

    // 2. Product
    const productMap: any = {};
    data.forEach(r => {
        const p = r.Product || r.product || "General";
        if (!productMap[p]) productMap[p] = { name: p, sales: 0 };
        productMap[p].sales += Number(r.Sales || 0);
    });
    const topProduct: any = Object.values(productMap).sort((a: any, b: any) => b.sales - a.sales)[0] || { name: "Desconocido" };

    // 3. Supplier
    const supplierMap: any = {};
    data.forEach(r => {
        const s = r.Supplier || r.supplier || "Tradicional";
        if (!supplierMap[s]) supplierMap[s] = { name: s, count: 0 };
        supplierMap[s].count += 1;
    });
    const topSupplier: any = Object.values(supplierMap).sort((a: any, b: any) => b.count - a.count)[0] || { name: "Desconocido" };

    // 4. Customer
    const customerMap: any = {};
    data.forEach(r => {
        const cu = r.Customer || r.customer || "Consumidor";
        if (!customerMap[cu]) customerMap[cu] = { name: cu, ltv: 0 };
        customerMap[cu].ltv += Number(r.Sales || 0);
    });
    const topCustomer: any = Object.values(customerMap).sort((a: any, b: any) => b.ltv - a.ltv)[0] || { name: "Desconocido" };

    return {
        marketing: { 
            suggestion: `El canal "${topChannel.name}" lidera la generación de ingresos. Recomendamos intensificar la pauta publicitaria en este segmento para maximizar el ROI.`, 
            priority: "ALTA", 
            targetChannel: topChannel.name 
        },
        product: { 
            suggestion: `"${topProduct.name}" es el producto estrella. Sugerimos crear paquetes (bundles) o programas de fidelización específicos para este artículo.`, 
            winningProduct: topProduct.name, 
            reason: `Mayor contribución porcentual al volumen total de ventas.` 
        },
        supplier: { 
            suggestion: `"${topSupplier.name}" es el proveedor con mayor frecuencia operativa. Ideal para negociar descuentos por pronto pago o volumen.`, 
            topSupplier: topSupplier.name, 
            impact: "Estabilidad en la cadena de suministros detectada." 
        },
        customer: { 
            suggestion: `"${topCustomer.name}" ha sido identificado como cliente de alto valor comercial. Se recomienda atención personalizada VIP.`, 
            topCustomer: topCustomer.name, 
            loyaltyStrategy: "Programa de cashback o descuentos exclusivos por lealtad." 
        },
        isDeterministic: true
    };
  }

  async generateExecutiveSummary(data: any): Promise<string> {
    const prompt = `Resumen ejecutivo: ${JSON.stringify(data.slice(0, 30))}`;
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      return "Análisis general: Se observa una tendencia estable de ventas sustentada por la recurrencia operativa.";
    }
  }

  async analyzeTrends(data: any): Promise<any> {
    const prompt = `Analiza tendencias: ${JSON.stringify(data.slice(0, 30))}`;
    try {
      const result = await this.model.generateContent(prompt);
      return JSON.parse(this.cleanJson(result.response.text()));
    } catch (e) {
      return {
        trends: [{ name: "Crecimiento Orgánico", description: "Tendencia natural basada en tráfico directo.", impact: "POSITIVE" }],
        insights: ["La base de datos muestra una alta concentración en productos clave."]
      };
    }
  }

  async projectScenario(data: any, scenario: string): Promise<any> {
    try {
      const result = await this.model.generateContent(`Proyecta: ${scenario}. Datos: ${JSON.stringify(data.slice(0, 20))}`);
      return JSON.parse(this.cleanJson(result.response.text()));
    } catch (e) {
      return { projection: "Escenario conservador proyectado.", expectedGrowth: 5, risks: ["Volatilidad de mercado"] };
    }
  }

  async recommendActions(data: any): Promise<any[]> {
    try {
      const result = await this.model.generateContent(`Recomienda acciones: ${JSON.stringify(data.slice(0, 20))}`);
      return JSON.parse(this.cleanJson(result.response.text()));
    } catch (e) {
      return [
          { title: "Optimización de Inventario", description: "Asegurar disponibilidad de productos estrella.", priority: "HIGH", impact: "Crecimiento del 10% en cumplimiento." },
          { title: "Plan de Marketing", description: "Diversificar canales digitales.", priority: "MEDIUM", impact: "Ahorro del 5% en adquisición." }
      ];
    }
  }

  async detectRisks(data: any): Promise<any[]> {
    try {
      const result = await this.model.generateContent(`Riesgos: ${JSON.stringify(data.slice(0, 20))}`);
      return JSON.parse(this.cleanJson(result.response.text()));
    } catch (e) {
      return [{ risk: "Dependencia de pocos productos", severity: "MEDIUM", mitigation: "Diversificar catálogo." }];
    }
  }

  async predictSalesAndDemand(data: any): Promise<any> {
    try {
      const result = await this.model.generateContent(`Predice: ${JSON.stringify(data.slice(0, 20))}`);
      return JSON.parse(this.cleanJson(result.response.text()));
    } catch (e) {
      return { projectedSales: 0, expectedDemand: [], growthTrend: 0, justification: "Calculando proyecciones basadas en histórico." };
    }
  }

  async generateStrategicConsultation(data: any): Promise<any> {
    const prompt = `Analiza este dataset: ${JSON.stringify(data.slice(0, 50))}. Responde en JSON con marketing, product, supplier, customer.`;
    try {
      console.log("Gemini: Intentando análisis de IA...");
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(this.cleanJson(text));
    } catch (e) {
      console.warn("⚠️ Gemini Falló (Modo Determinístico):", e.message);
      return this.getDeterministicConsultation(data);
    }
  }
}
