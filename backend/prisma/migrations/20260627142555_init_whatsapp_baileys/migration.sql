-- CreateTable
CREATE TABLE "ai_agent_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "system_prompt" TEXT NOT NULL DEFAULT 'Anda adalah asisten AI toko online UMKM. Jawab pertanyaan pelanggan dengan ramah, singkat, dan informatif.',
    "gemini_api_key" TEXT,
    "groq_api_key" TEXT,
    "cohere_api_key" TEXT,
    "openrouter_key" TEXT,
    "primary_provider" TEXT NOT NULL DEFAULT 'gemini',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agent_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_router_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "fallback_used" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL,
    "latency_ms" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_router_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_agent_configs_tenant_id_key" ON "ai_agent_configs"("tenant_id");

-- CreateIndex
CREATE INDEX "ai_router_logs_tenant_id_idx" ON "ai_router_logs"("tenant_id");
