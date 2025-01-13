<template>
  <div class="full-page">
    <h2>CFG 结构</h2>
    <div ref="graphContainer" class="graph-container">
      <div class="zoom-controls">
        <button @click="zoomIn">放大</button>
        <button @click="zoomOut">缩小</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as d3 from 'd3';

// 引用容器元素
const graphContainer = ref(null);

// 动态获取 CFG 数据
let cfgData = ref(null); // 使用 ref 来存储动态获取的数据

// 定义 zoom 行为
let zoom = d3.zoom();
let svg, simulation, link, node;

// 窗口大小变化时的处理函数
function handleResize() {
  const newWidth = graphContainer.value.clientWidth;
  const newHeight = graphContainer.value.clientHeight;

  // 更新 SVG 的宽高
  svg.attr("width", newWidth).attr("height", newHeight);

  // 更新力导向图的中心点
  simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
  simulation.alpha(0.3).restart(); // 重新启动模拟器
}

// 放大功能
function zoomIn() {
  svg.transition().call(zoom.scaleBy, 1.2); // 放大 1.2 倍
}

// 缩小功能
function zoomOut() {
  svg.transition().call(zoom.scaleBy, 0.8); // 缩小 0.8 倍
}

// 计算节点宽度
function getNodeWidth(d) {
  const maxLineLength = Math.max(...d.label.map((line) => line.length));
  return maxLineLength * 8 + 20; // 根据最长行长度动态计算宽度
}

// 计算节点高度
function getNodeHeight(d) {
  return d.label.length * 20 + 20; // 根据行数动态计算高度
}

// 计算节点边缘的偏移量（从节点最近边缘出发，并保持 5 像素的距离）
function getNodeOffset(source, target) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const angle = Math.atan2(dy, dx);

  // 计算节点宽度和高度的一半
  const halfWidth = getNodeWidth(source) / 2;
  const halfHeight = getNodeHeight(source) / 2;

  // 计算从节点最近边缘出发的偏移量，并保持 5 像素的距离
  const offsetX = Math.cos(angle) * (halfWidth + 5); // 增加 5 像素的距离
  const offsetY = Math.sin(angle) * (halfHeight + 5); // 增加 5 像素的距离

  return { offsetX, offsetY };
}

// 计算节点对面边缘的偏移量（从节点对面边缘出发，并保持 5 像素的距离）
function getNodeOppositeOffset(source, target) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const angle = Math.atan2(dy, dx);

  // 计算节点宽度和高度的一半
  const halfWidth = getNodeWidth(target) / 2;
  const halfHeight = getNodeHeight(target) / 2;

  // 计算从节点对面边缘出发的偏移量，并保持 5 像素的距离
  const offsetX = Math.cos(angle) * (halfWidth + 5); // 增加 5 像素的距离
  const offsetY = Math.sin(angle) * (halfHeight + 5); // 增加 5 像素的距离

  return { offsetX, offsetY };
}

// 绘制 CFG 图
onMounted(async () => {
  try {
    // 发起 HTTP 请求获取 CFG 数据
    const response = await fetch('http://127.0.0.1:8080/method/cfg?method=');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    cfgData.value = await response.json(); // 将返回的 JSON 数据赋值给 cfgData

    // 转换节点数据
    const nodes = cfgData.value.nodes.map((n) => ({
      id: n.node.offset.toString(), // 使用 offset 作为 id
      offset: n.node.offset,
      asm: n.node.asm,
      label: n.node.asm.map((a) => `${a.offset}: ${a.code} # ${a.pseudo}`) // 将 asm 内容逐行存储
    }));

    // 转换边数据：将 source 和 target 从字符串转换为节点对象
    const edges = cfgData.value.edges.map((e) => ({
      source: nodes.find((n) => n.id === e.source), // 找到对应的节点对象
      target: nodes.find((n) => n.id === e.target), // 找到对应的节点对象
      value: e.value,
    }));

    // 设置 SVG 容器的宽高
    const containerWidth = graphContainer.value.clientWidth; // 容器宽度
    const containerHeight = graphContainer.value.clientHeight; // 容器高度

    // 创建 SVG 元素
    svg = d3
      .select(graphContainer.value)
      .append("svg")
      .attr("width", "100%") // 宽度设置为 100%
      .attr("height", "100%"); // 高度设置为 100%

    // 定义箭头
    svg
      .append("defs")
      .selectAll("marker")
      .data(["arrow-true", "arrow-false"]) // 两种箭头：true 和 false
      .enter()
      .append("marker")
      .attr("id", (d) => d)
      .attr("viewBox", "0 -5 10 10") // 箭头视图框
      .attr("refX", 10) // 箭头起点离目标节点的距离（靠近但不重叠）
      .attr("refY", 0)
      .attr("markerWidth", 8) // 箭头大小
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5") // 箭头的路径
      .attr("fill", (d) => (d === "arrow-true" ? "#999" : "red")); // true 显示灰色箭头，false 显示红色箭头

    // 创建力导向图模拟器
    simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id((d) => d.id).distance(150) // 增加边距
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(containerWidth / 2, containerHeight / 2)) // 中心点设置为 SVG 的中心
      .force("collision", d3.forceCollide().radius((d) => Math.max(getNodeWidth(d), getNodeHeight(d)) / 2 + 25)); // 强制节点间隔 50px

    // 创建边
    link = svg
      .append("g")
      .selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("stroke", (d) => (d.value ? "#999" : "red")) // true 显示灰色边，false 显示红色边
      .attr("stroke-width", 2)
      .attr("marker-end", (d) =>
        d.value ? "url(#arrow-true)" : "url(#arrow-false)" // 根据 value 添加箭头
      );

    // 创建节点组
    node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(
        d3
          .drag() // 添加拖拽功能
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      );

    // 添加节点矩形背景
    const nodeRect = node
      .append("rect")
      .attr("rx", 5) // 圆角
      .attr("ry", 5)
      .attr("fill", "#69b3a2")
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("width", (d) => getNodeWidth(d))
      .attr("height", (d) => getNodeHeight(d))
      .attr("x", (d) => -getNodeWidth(d) / 2)
      .attr("y", (d) => -getNodeHeight(d) / 2);

    // 添加节点内容（使用 foreignObject 支持 HTML）
    const nodeContent = node
      .append("foreignObject")
      .attr("width", (d) => getNodeWidth(d)) // 动态宽度
      .attr("height", (d) => getNodeHeight(d)) // 动态高度
      .attr("x", (d) => -getNodeWidth(d) / 2) // 水平居中
      .attr("y", (d) => -getNodeHeight(d) / 2) // 垂直居中
      .append("xhtml:div")
      .style("font-size", "12px")
      .style("padding", "8px")
      .style("color", "#333")
      .style("background", "transparent")
      .html((d) => d.label.map((line) => `<div>${line}</div>`).join("")); // 逐行显示内容

    // 更新力导向图
    simulation.nodes(nodes).on("tick", () => {
      // 更新边的起点和终点，确保箭头指向节点最近边缘并保持 5 像素的距离
      link
        .attr("x1", (d) => {
          const { offsetX } = getNodeOffset(d.source, d.target);
          return d.source.x + offsetX;
        })
        .attr("y1", (d) => {
          const { offsetY } = getNodeOffset(d.source, d.target);
          return d.source.y + offsetY;
        })
        .attr("x2", (d) => {
          const { offsetX } = getNodeOppositeOffset(d.source, d.target);
          return d.target.x - offsetX;
        })
        .attr("y2", (d) => {
          const { offsetY } = getNodeOppositeOffset(d.source, d.target);
          return d.target.y - offsetY;
        });

      // 更新节点的位置
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // 设置边的源和目标
    simulation.force("link").links(edges);

    // 拖拽功能
    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // 启用缩放功能
    zoom.on("zoom", (event) => {
      const transform = event.transform;
      const scale = transform.k; // 获取当前缩放比例

      // 更新节点和边的位置
      node.attr("transform", (d) => `translate(${transform.applyX(d.x)},${transform.applyY(d.y)})`);
      link
        .attr("x1", (d) => {
          const { offsetX } = getNodeOffset(d.source, d.target);
          return transform.applyX(d.source.x) + offsetX * scale;
        })
        .attr("y1", (d) => {
          const { offsetY } = getNodeOffset(d.source, d.target);
          return transform.applyY(d.source.y) + offsetY * scale;
        })
        .attr("x2", (d) => {
          const { offsetX } = getNodeOppositeOffset(d.source, d.target);
          return transform.applyX(d.target.x) - offsetX * scale;
        })
        .attr("y2", (d) => {
          const { offsetY } = getNodeOppositeOffset(d.source, d.target);
          return transform.applyY(d.target.y) - offsetY * scale;
        });

      // 动态调整节点大小和文本大小
      node.select("rect")
        .attr("width", (d) => getNodeWidth(d) * scale) // 动态调整节点宽度
        .attr("height", (d) => getNodeHeight(d) * scale) // 动态调整节点高度
        .attr("x", (d) => (-getNodeWidth(d) * scale) / 2) // 水平居中
        .attr("y", (d) => (-getNodeHeight(d) * scale) / 2); // 垂直居中

      node.select("foreignObject")
        .attr("width", (d) => getNodeWidth(d) * scale) // 动态调整宽度
        .attr("height", (d) => getNodeHeight(d) * scale) // 动态调整高度
        .attr("x", (d) => (-getNodeWidth(d) * scale) / 2) // 水平居中
        .attr("y", (d) => (-getNodeHeight(d) * scale) / 2) // 垂直居中
        .select("div")
        .style("font-size", `${12 * scale}px`); // 动态调整字体大小

      // 动态调整边的宽度
      link.attr("stroke-width", 2 * scale); // 动态调整边的宽度
    });
    svg.call(zoom);

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 在模拟结束后调整 SVG 的 viewBox
    simulation.on("end", () => {
      // 获取所有节点的边界框
      const nodeBBoxes = nodes.map((d) => {
        const width = getNodeWidth(d);
        const height = getNodeHeight(d);
        return {
          x: d.x - width / 2,
          y: d.y - height / 2,
          width,
          height,
        };
      });

      // 计算整个图的边界框
      const graphBBox = nodeBBoxes.reduce(
        (acc, bbox) => ({
          x: Math.min(acc.x, bbox.x),
          y: Math.min(acc.y, bbox.y),
          width: Math.max(acc.width, bbox.x + bbox.width),
          height: Math.max(acc.height, bbox.y + bbox.height),
        }),
        { x: Infinity, y: Infinity, width: -Infinity, height: -Infinity }
      );

      // 调整 SVG 的 viewBox
      const padding = 50; // 边距
      svg.attr("viewBox", `${graphBBox.x - padding} ${graphBBox.y - padding} ${graphBBox.width + 2 * padding} ${graphBBox.height + 2 * padding}`);
    });
  } catch (error) {
    console.error('Error fetching CFG data:', error);
  }
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* 使页面占满父容器的空间 */
.full-page {
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中 */
  justify-content: center; /* 垂直居中 */
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  overflow: hidden; /* 禁用滚动条 */
}

/* 图表容器样式 */
.graph-container {
  width: 100%; /* 宽度占满父容器 */
  height: 100%; /* 高度占满父容器 */
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  overflow: auto; /* 启用滚动条 */
  position: relative;
}

/* 缩放按钮样式 */
.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.zoom-controls button {
  margin: 0 5px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
}
</style>