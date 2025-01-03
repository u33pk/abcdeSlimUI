<template>
    <div>
      <h2>CFG 结构</h2>
      <div ref="graphContainer" class="graph-container"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import * as d3 from 'd3';
  
  // 写死的 CFG 数据
  const cfgData = {
    nodes: [
      { id: "0", offset: 0, asm: [] }, // 添加 id 字段
      { id: "15", offset: 15, asm: [] },
      { id: "38", offset: 38, asm: [] },
    ],
    edges: [
      { source: "0", target: "15", value: true },  // 有箭头
      { source: "0", target: "38", value: false }, // 无箭头
      { source: "15", target: "38", value: true }, // 有箭头
    ],
  };
  
  // 引用容器元素
  const graphContainer = ref(null);
  
  // 绘制 CFG 图
  onMounted(() => {
    const { nodes, edges } = cfgData;
  
    // 设置 SVG 容器的宽高
    const width = 800;
    const height = 600;
  
    // 创建 SVG 元素
    const svg = d3.select(graphContainer.value)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  
    // 定义箭头
    svg.append('defs').selectAll('marker')
      .data(['arrow-true', 'arrow-false']) // 两种箭头：true 和 false
      .enter()
      .append('marker')
      .attr('id', d => d)
      .attr('viewBox', '0 -5 10 10') // 箭头视图框
      .attr('refX', 12) // 箭头起点离目标节点的距离（靠近但不重叠）
      .attr('refY', 0)
      .attr('markerWidth', 8) // 箭头大小
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5') // 箭头的路径
      .attr('fill', d => (d === 'arrow-true' ? '#999' : 'none')); // true 显示箭头，false 不显示
  
    // 创建力导向图模拟器
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id).distance(100)) // 使用 id 访问器
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));
  
    // 创建边
    const link = svg.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('marker-end', d => `url(#${d.value ? 'arrow-true' : 'arrow-false'})`); // 根据 value 添加箭头
  
    // 创建节点
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .call(
        d3.drag() // 添加拖拽功能
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      );
  
    // 添加节点标签
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text(d => `Node ${d.offset}`)
      .attr('font-size', 12)
      .attr('dx', 15)
      .attr('dy', 4);
  
    // 添加节点信息提示
    node.append('title') // 使用 title 元素作为默认提示
      .text(d => `Node ID: ${d.id}\nOffset: ${d.offset}`);
  
    // 自定义工具提示
    const tooltip = d3.select(graphContainer.value)
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);
  
    // 鼠标悬停显示自定义工具提示
    node.on('mouseover', (event, d) => {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(`Node ID: ${d.id}<br>Offset: ${d.offset}`)
        .style('left', `${event.pageX + 5}px`)
        .style('top', `${event.pageY - 28}px`);
    })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });
  
    // 更新力导向图
    simulation.nodes(nodes).on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => {
          // 计算边的终点位置，避免箭头与节点重叠
          const targetNode = nodes.find(n => n.id === d.target.id);
          const dx = targetNode.x - d.source.x;
          const dy = targetNode.y - d.source.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const offset = (length - 10) / length; // 减去节点半径
          return d.source.x + dx * offset;
        })
        .attr('y2', d => {
          const targetNode = nodes.find(n => n.id === d.target.id);
          const dx = targetNode.x - d.source.x;
          const dy = targetNode.y - d.source.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const offset = (length - 10) / length; // 减去节点半径
          return d.source.y + dy * offset;
        });
  
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
  
      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });
  
    // 设置边的源和目标
    simulation.force('link').links(edges);
  
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
  });
  </script>
  
  <style scoped>
  .graph-container {
    width: 100%;
    height: 600px;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }
  </style>