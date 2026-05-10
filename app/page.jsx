"use client";

import Image from "next/image";
import { BlockMath, InlineMath } from "react-katex";
import { useEffect, useState } from "react";
import computeMemory from "../images/compute-memory.png";
import encoderTitle from "../images/encoder-title.png";
import fatCat from "../images/fat-cat.png";
import rickroll from "../images/rickroll.png";
import table from "../images/table.png";

const navItems = [
  { id: "about", label: "about" },
  { id: "projects", label: "projects" },
  { id: "thoughts", label: "thoughts" },
  { id: "reading", label: "reading" },
];

const panelIds = [...navItems.map((item) => item.id), "beyond-kv-cache"];

const ecRoleCode = `from vllm.config.utils import config

ECProducer = Literal["ec_producer", "ec_both"]
ECConsumer = Literal["ec_consumer", "ec_both"]
ECRole = Literal[ECProducer, ECConsumer]`;

const memoryFormatCode = `KV_2LTD  # [2, num_layers, num_tokens, hidden_dim]
KV_T2D   # [num_tokens, 2, hidden_dim]
KV_2TD   # [2, num_tokens, hidden_dim]
EC_TD    # [num_tokens, hidden_dim]`;

const encoderSliceCode = `mm_embeds_item = encoder_output[start_idx:end_idx]`;

const ecStoreCode = `mem_obj = self._storage_manager.allocate(
    shapes=tensor.shape,
    dtypes=tensor.dtype,
    fmt=MemoryFormat.EC_TD,
)
mem_obj.tensor.copy_(tensor)`;

export default function Home() {
  const [activePanel, setActivePanel] = useState("about");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionScope, setTransitionScope] = useState("content");
  const isProjectWriteup = activePanel === "beyond-kv-cache";

  useEffect(() => {
    const initialPanel = window.location.hash.replace("#", "");

    if (panelIds.includes(initialPanel)) {
      setActivePanel(initialPanel);
    }
  }, []);

  function showPanel(id, scope = "content") {
    if (id === activePanel || isTransitioning) {
      return;
    }

    window.history.replaceState(null, "", `#${id}`);
    setTransitionScope(scope);
    setIsTransitioning(true);

    window.setTimeout(() => {
      setActivePanel(id);

      window.requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 220);
  }

  return (
    <div
      className={`site-shell ${isProjectWriteup ? "writeup-shell" : ""} ${
        isTransitioning && transitionScope === "shell" ? "is-switching" : ""
      }`}
    >
      {!isProjectWriteup && (
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={getNavId(activePanel) === item.id ? "active" : undefined}
              aria-current={getNavId(activePanel) === item.id ? "page" : undefined}
              onClick={() => showPanel(item.id, "content")}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      <main className="page">
        <div
          className={`content-panel ${
            isTransitioning && transitionScope === "content" ? "is-switching" : ""
          }`}
        >
          {activePanel === "about" && <AboutPanel />}
          {activePanel === "projects" && (
            <ProjectsPanel
              onOpenProject={() => showPanel("beyond-kv-cache", "shell")}
            />
          )}
          {activePanel === "beyond-kv-cache" && (
            <BeyondKvCachePanel onBack={() => showPanel("projects", "shell")} />
          )}
          {activePanel === "thoughts" && (
            <ListPanel
              title="Thoughts"
              items={[{ href: "#", title: "coming soon", meta: "writing" }]}
            />
          )}
          {activePanel === "reading" && (
            <ListPanel
              title="Reading"
              items={[{ href: "#", title: "The Alchemist", meta: "current" }]}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function getNavId(panelId) {
  if (panelId === "beyond-kv-cache") {
    return "projects";
  }

  return panelId;
}

function AboutPanel() {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <h1 id="intro-title">Ben</h1>
      <p>I study Computer Science at the University of Waterloo.</p>

      <div className="current-work">
        <p>currently:</p>
        <ul>
          <li>
            Working on inference at <strong>TensorMesh</strong>
          </li>
          <li>Researching a bit on world models, mainly V-JEPA</li>
          <li>
            Reading <strong>The Alchemist</strong>
          </li>
        </ul>
      </div>

      <p>
        Previously worked on Notebooks at <strong>Databricks</strong>,
        AI-Gateway/Agents at <strong>Vercel</strong>, Instagram at{" "}
        <strong>Meta</strong>, and AI onboarding workflows at{" "}
        <strong>Shopify</strong>.
      </p>
      <p>
        This is a place to share my thoughts to the world, whether that be my
        projects, experiences, readings, or just random thoughts.
      </p>
    </section>
  );
}

function ProjectsPanel({ onOpenProject }) {
  return (
    <section className="content-section" aria-labelledby="projects-title">
      <h2 id="projects-title">Projects</h2>
      <article className="project-card">
        <button
          className="project-copy"
          type="button"
          onClick={onOpenProject}
        >
          <h3>Beyond KV Cache</h3>
          <p>
            Implementing encoder caching for multimodal inference
          </p>
        </button>
        <div className="project-image">
          <Image
            src={encoderTitle}
            alt="Diagram titled Beyond KV Cache showing encoder cache reuse for multimodal inference"
            placeholder="blur"
            sizes="(max-width: 720px) 100vw, 560px"
          />
        </div>
      </article>
    </section>
  );
}

function BeyondKvCachePanel({ onBack }) {
  return (
    <article className="article-panel" aria-labelledby="beyond-kv-cache-title">
      <button className="back-link" type="button" onClick={onBack}>
        <span aria-hidden="true">‹</span>
        back to projects
      </button>
      <h2 id="beyond-kv-cache-title">Beyond KV Cache</h2>
      <div className="article-meta" aria-label="Article metadata">
        <span>Benjamin Bai</span>
        <span className="article-separator" aria-hidden="true">
          ·
        </span>
        <span>May 2026</span>
        <span className="article-separator" aria-hidden="true">
          ·
        </span>
        <a
          href="https://docs.lmcache.ai/non_kv_cache/encoder_cache.html"
          target="_blank"
          rel="noreferrer"
        >
          LMCache docs
        </a>
      </div>
      <section className="article-section" aria-labelledby="state-of-inference">
        <h3 id="state-of-inference">State of Inference</h3>
        <p>
          LLM inference is increasingly trending toward disaggregation:
          splitting the serving pipeline into stages with different resource
          profiles and optimizing each stage independently.
        </p>
        <p>
          The clearest example is Prefill-Decode (PD) disaggregation. Systems
          like DistServe showed that prefill and decode have different resource
          profiles: prefill is latency-sensitive and compute-heavy, while decode
          is constrained by per-token generation and memory bandwidth. By
          separating the two, systems can optimize TTFT and TPOT independently.
          This idea has since moved beyond research: production inference stacks
          increasingly specialize each stage, and NVIDIA&apos;s Vera Rubin
          platform points to the same trend at the hardware level, combining
          Vera CPUs, Rubin GPUs, and rack-scale networking so different parts of
          the inference pipeline can be mapped onto the hardware best suited for
          them.
        </p>
        <p>
          The direction is clear: inference is becoming stage-aware. Different
          parts of the pipeline are compute-bound, memory-bound, or
          network-bound, and modern systems increasingly optimize each stage
          separately.
        </p>
      </section>
      <section
        className="article-section"
        aria-labelledby="from-disaggregation-to-multimodality"
      >
        <h3 id="from-disaggregation-to-multimodality">
          From Disaggregation to Multimodality
        </h3>
        <p>
          As transformers become increasingly multimodal, with even
          terminal-based harnesses like Claude and Codex supporting images and
          videos, new compute-intensive stages are introduced before tokens even
          reach the language model: the encoder.
        </p>
        <p>
          The key architectural point is ordering: Encoder → Prefill → Decode.
          This means decoder-side cache optimizations cannot remove encoder
          recompute by themselves.
        </p>
        <figure className="article-image article-image-shift-left">
          <Image
            src={computeMemory}
            alt="Compute and memory requirements across encoder, prefill, and decode stages"
            placeholder="blur"
            sizes="(max-width: 720px) 100vw, 560px"
          />
        </figure>
        <p>
          The encoder is heavily compute-bound because it turns dense media
          inputs into feature tensors (more on this). Prefill is also
          compute-intensive, but decode shifts toward memory pressure because
          generation repeatedly reads and writes KV cache one token at a time.
          This naturally leads to Encoder-Prefill-Decode disaggregation.
        </p>
        <p>
          But even this is not enough. Disaggregation improves where computation
          runs, but it does not eliminate whether it runs. In real workloads,
          the same image, video, or audio input is often queried repeatedly with
          different prompts. Yet each request still triggers a full encoder
          forward pass.
        </p>
        <p>
          And so this brings us to the core of this writeup, we introduce
          encoder cache (EC): persisting multimodal encoder features so repeated
          requests can skip encoder execution and go straight to LLM
          conditioning. This marks the beginning of LMCache&apos;s evolution from
          a KV cache layer into a generalized, LLM-native data plane for
          inference.
        </p>
        <h3 id="encoder-side-image-video">
          Encoder Side (Image/Video): Why It Is Compute-Heavy
        </h3>
        <p>
          Now before we jump into the technical wacky implementation, let&apos;s
          first go back to understand encoding a bit better, especially when it
          comes to images and videos.
        </p>
        <figure className="article-image">
          <Image
            src={fatCat}
            alt="Diagram showing image and video inputs split into patches, flattened into tokens, and processed by transformer encoder self-attention"
            placeholder="blur"
            sizes="(max-width: 720px) 100vw, 640px"
          />
        </figure>
        <p>
          Under the hood, image and video encoders are just transformers
          operating over visual tokens. An image of size{" "}
          <InlineMath math="H \times W" /> is split into patches of size{" "}
          <InlineMath math="P \times P" />, producing{" "}
          <InlineMath math="N = \frac{H}{P} \cdot \frac{W}{P}" />.
        </p>
        <p>
          These tokens are projected into a hidden dimension{" "}
          <InlineMath math="d" />, and each transformer layer applies
          self-attention. Queries, keys, and values are computed as{" "}
          <InlineMath math="Q = XW_Q,\quad K = XW_K,\quad V = XW_V" />.
        </p>
        <p>
          Attention is then computed as{" "}
          <InlineMath math="\operatorname{Attn}(X) = \operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d}}\right)V" />
          .
        </p>
        <p>
          The dominant cost comes from the <InlineMath math="QK^\top" /> term,
          which scales as <InlineMath math="O(N^2 d)" />.
        </p>
        <p>
          For images, <InlineMath math="N" /> is already on the order of a few
          hundred tokens, but for video, with <InlineMath math="T" /> frames,
          this grows to:
        </p>
        <BlockMath math="N = T \cdot \frac{H}{P} \cdot \frac{W}{P}" />
        <p>
          In the worst case, full spatiotemporal attention leads to quadratic
          scaling across both space and time:
        </p>
        <BlockMath math="O\left((T \cdot N_{\mathrm{img}})^2 d\right)" />
        <p>
          In practice, even frame-wise encoding still requires a full encoder
          forward pass per frame:
        </p>
        <BlockMath math="O\left(T \cdot N_{\mathrm{img}}^2 d\right)" />
        <p>
          The result is thousands of tokens processed per request, with dense
          matrix multiplies repeated from scratch. Unlike decoding, which reuses
          KV cache and is largely memory-bandwidth bound, the encoder remains
          fundamentally compute-bound, and as multimodal inputs scale, it
          quickly becomes the dominant cost in the inference pipeline.
        </p>
      </section>
      <section className="article-section" aria-labelledby="from-epd-to-ec-caching">
        <h3 id="from-epd-to-ec-caching">From EPD to EC Caching</h3>
        <p>
          The core idea is simple: treat encoder outputs as first-class cache
          artifacts, just like KV.
        </p>
        <p>
          Each multimodal input unit (image/video/audio) is mapped to a stable
          identifier (<code>mm_hash</code>), and we use the <code>mm_hash</code>{" "}
          as the lookup key for encoder features.
        </p>
        <p>At runtime, the flow is:</p>
        <ol className="article-list">
          <li>
            Scheduler checks whether encoder features (encoder output tensors)
            for <code>mm_hash</code> already exist.
          </li>
          <li>Worker attempts load before encoder execution.</li>
          <li>On hit, encoder compute is skipped.</li>
          <li>On miss, worker runs encoder once and persists features to LMCache.</li>
          <li>Later requests reuse the stored features.</li>
        </ol>
        <p>
          The key design constraint was to avoid building a separate serving
          stack for EC caching. Instead, EC caching should be able to plug into
          the existing <code>KVConnector</code> API repurposed for encoder
          states.
        </p>
        <CodeBlock code={ecRoleCode} language="python" />
        <p>
          The first change was to extend vLLM&apos;s EC role model. EPD
          disaggregation already separated the encoder path into producer and
          consumer roles, but caching needs both behaviors in the same engine:
          check for existing encoder features before running the encoder, then
          persist the newly computed features on a miss. Adding{" "}
          <code>ec_both</code> to the EC role enumeration made that lifecycle
          explicit.
        </p>
      </section>
      <section
        className="article-section"
        aria-labelledby="indexing-granularity-cache-hit"
      >
        <h3 id="indexing-granularity-cache-hit">
          Indexing: the granularity and looseness of a cache hit
        </h3>
        <figure className="article-image">
          <Image
            src={rickroll}
            alt="Diagram showing video, audio, and image embeddings mapped into an EC cache engine key"
            placeholder="blur"
            sizes="(max-width: 720px) 100vw, 640px"
          />
        </figure>
        <p>
          Conceptually, EC maps multimodal inputs to computational encodings.
          The diagram above shows video, audio, and image inputs flowing through
          an encoder into cacheable embedding blocks, and then into a cache
          index. That last step is where correctness lives: the cache key cannot
          be only &quot;this image&quot; or &quot;this video.&quot; It has to mean
          &quot;this input, encoded this exact way.&quot;
        </p>
        <p>
          In the implementation, EC reuses the same <code>CacheEngineKey</code>{" "}
          type as KV cache, but the fields have deliberately different meanings:
        </p>
        <figure className="article-image">
          <Image
            src={table}
            alt="Table comparing CacheEngineKey field meanings between KV cache and EC cache"
            placeholder="blur"
            sizes="(max-width: 720px) 100vw, 640px"
          />
        </figure>
        <p>
          KV entries are partitioned by decoder parallelism, so each block
          belongs to a specific tensor-parallel rank. EC entries instead
          represent encoder features produced at the multimodal feature
          boundary. The current EC key still carries vLLM parallel metadata
          through <code>world_size</code> and <code>worker_id</code>, while the
          media identity is stored in <code>chunk_hash</code> as a stable hash
          of <code>mm_hash</code>.
        </p>
        <p>
          However, <code>mm_hash</code> alone is not enough to define reuse. A
          cached encoder tensor is only valid if the full encoding contract
          matches: the encoder checkpoint, processor config, dtype, feature
          layout, and cache namespace. The same image encoded with a different
          vision encoder, resize policy, or precision must not reuse the same
          tensor.
        </p>
        <p>
          So EC can reuse <code>CacheEngineKey</code> for storage compatibility,
          but not KV&apos;s indexing assumptions. Wider keys may look better for
          hit rate, but narrower keys keep cache hits semantically correct.
        </p>
        <h3 id="implementation-detail-tensor-layout">
          Implementation detail: tensor layout matters
        </h3>
        <p>
          One subtle implementation choice is that EC gets its own memory format
          instead of pretending to be KV cache. KV formats carry extra info for
          keys, values, layers, and attention layouts, which we don&apos;t need
          because encoder outputs are simple: one feature tensor per multimodal
          input, shaped as <code>[num_tokens, hidden_dim]</code>.
        </p>
        <CodeBlock code={memoryFormatCode} language="python" />
        <p>
          That small difference matters because vLLM consumes encoder features
          by slicing over the token range needed in the current scheduler step:
        </p>
        <CodeBlock code={encoderSliceCode} language="python" />
        <p>
          This works efficiently because vLLM stores encoder outputs with the
          token dimension first: <code>[num_tokens, hidden_dim]</code>. When the
          worker needs only a range of encoder tokens,{" "}
          <code>encoder_output[start_idx:end_idx]</code> selects a contiguous
          slice along that first dimension. If tokens were stored behind another
          dimension, the same operation would require gathering or transposing
          data before transfer.
        </p>
        <p>
          The store path is intentionally just as direct. Once LMCache allocates
          the destination object with <code>MemoryFormat.EC_TD</code>, the
          engine copies the encoder tensor into the allocated storage:
        </p>
        <CodeBlock code={ecStoreCode} language="python" />
        <p>
          In practice, this keeps EC persistence on the tensor-copy path rather
          than a serialized object path. With pinned host buffers and
          non-blocking copy paths elsewhere in the engine, this is the shape of
          operation GPUs handle well: bulk tensor movement through the copy
          engine, without turning encoder features into Python objects or
          conflicting with the main inference kernels more than necessary.
        </p>
        <h3 id="benchmark">Benchmark</h3>
        <p>
          Live measurement on a single H100 80GB with
          Qwen/Qwen2.5-VL-7B-Instruct (bf16) and Big Buck Bunny (10:34, 720p, ≈
          60 MB MP4). Same chat-completion request sent 1 cold + N warm times
          against the same vLLM server.
        </p>
        <p>
          Two configurations, varying only <code>num_frames</code> (how many
          frames vLLM samples from the video):
        </p>
        <div className="article-table-wrap">
          <table className="article-table">
            <thead>
              <tr>
                <th>
                  <code>num_frames</code>
                </th>
                <th>EC entry</th>
                <th>Cold TTFT (s)</th>
                <th>Warm TTFT mean (s)</th>
                <th>Saved</th>
                <th>Speedup</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>32 (vLLM default)</td>
                <td>34.3 MB</td>
                <td>3.923</td>
                <td>3.125</td>
                <td>798 ms</td>
                <td>1.26×</td>
              </tr>
              <tr>
                <td>128</td>
                <td>130.8 MB</td>
                <td>5.895</td>
                <td>3.375</td>
                <td>2.52 s</td>
                <td>1.75×</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Speedup grows with <code>num_frames</code> because the encoder
          workload scales linearly with frame count while the rest of prefill
          (LM forward over the resulting multimodal tokens + the short text
          prompt) scales sublinearly. The same principle applies to other
          modalities: the win is largest when the encoder is the dominant share
          of prefill (long videos at high frame counts, long audio clips, large
          images at high resolution) and smallest when text prefill dominates.
        </p>
        <h3 id="learnings">Retrospective and Learnings</h3>
        <p>
          This project made me a better engineer because it forced me to reason
          from the workload first, not from the APIs that already existed. vLLM
          had <code>ec_producer</code> and <code>ec_consumer</code> roles, but
          the actual optimization did not fit neatly into either one. The useful
          question was not &quot;which role should I use?&quot; but &quot;what data is
          being recomputed, when is it available, and who needs to observe it?&quot;
        </p>
        <p>
          It also changed how I think about performance work. The first step is
          to decompose a request into stages, then ask what each stage is
          bottlenecked on: compute, memory bandwidth, I/O, synchronization, or
          scheduling. Once the stages are separated, the optimization target
          becomes much clearer. In this case, the encoder stage was not just
          expensive; it was deterministic for repeated media, which made it
          cacheable.
        </p>
        <p>
          The final lesson was that systems work lives in the details between
          components. A cache idea can sound simple at the algorithm level, but
          the real engineering is in metadata timing, ownership, tensor layout,
          async visibility, and deciding where the abstraction should sit.
          Getting those boundaries right is what makes an optimization feel like
          part of the serving engine instead of a one-off patch.
        </p>
      </section>
    </article>
  );
}

function ListPanel({ title, items }) {
  return (
    <section className="content-section" aria-labelledby={`${title}-title`}>
      <h2 id={`${title}-title`}>{title}</h2>
      <ul className="section-list">
        {items.map((item) => (
          <li key={item.title}>
            <a href={item.href}>{item.title}</a>
            <span>{item.meta}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CodeBlock({ code, language }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function highlightCode() {
      const { codeToHtml } = await import("shiki");
      const highlighted = await codeToHtml(code, {
        lang: language,
        theme: "github-light",
      });

      if (isMounted) {
        setHtml(highlighted);
      }
    }

    highlightCode();

    return () => {
      isMounted = false;
    };
  }, [code, language]);

  if (!html) {
    return (
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="code-block code-block-highlighted"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
