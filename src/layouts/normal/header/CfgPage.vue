<template>
    <div class="full-page">
      <h2>CFG 结构</h2>
      <div ref="graphContainer" class="graph-container"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as d3 from 'd3';
  
  // 写死的 CFG 数据
  const cfgData = {
  "nodes": [
    {
      "node": {
        "offset": 0,
        "asm": [
          {
            "offset": 0,
            "code": "ldai 0",
            "pseudo": "acc = 0",
            "common": "//6200000000"
          },
          {
            "offset": 5,
            "code": "sta v0",
            "pseudo": "v0 = acc",
            "common": "//6100"
          },
          {
            "offset": 7,
            "code": "ldai 2",
            "pseudo": "acc = 2",
            "common": "//6202000000"
          },
          {
            "offset": 12,
            "code": "sta v1",
            "pseudo": "v1 = acc",
            "common": "//6101"
          },
          {
            "offset": 14,
            "code": "ldai 1",
            "pseudo": "acc = 1",
            "common": "//6201000000"
          },
          {
            "offset": 19,
            "code": "sta v2",
            "pseudo": "v2 = acc",
            "common": "//6102"
          },
          {
            "offset": 21,
            "code": "ldai 5",
            "pseudo": "acc = 5",
            "common": "//6205000000"
          },
          {
            "offset": 26,
            "code": "sta v3",
            "pseudo": "v3 = acc",
            "common": "//6103"
          },
          {
            "offset": 28,
            "code": "ldai 10",
            "pseudo": "acc = 10",
            "common": "//620A000000"
          },
          {
            "offset": 33,
            "code": "sta v4",
            "pseudo": "v4 = acc",
            "common": "//6104"
          },
          {
            "offset": 35,
            "code": "ldundefined ",
            "pseudo": "acc = UNDEFINED",
            "common": "//00"
          },
          {
            "offset": 36,
            "code": "tryldglobalbyname 0 \"console\"",
            "pseudo": "acc = _GLOBAL[\"console\"]",
            "common": "//3F000000, 37:0"
          },
          {
            "offset": 40,
            "code": "sta v5",
            "pseudo": "v5 = acc",
            "common": "//6105"
          },
          {
            "offset": 42,
            "code": "ldobjbyname 1 \"log\"",
            "pseudo": "acc = acc[\"log\"]",
            "common": "//42010400"
          },
          {
            "offset": 46,
            "code": "sta v6",
            "pseudo": "v6 = acc",
            "common": "//6106"
          },
          {
            "offset": 48,
            "code": "lda.str \"start\"",
            "pseudo": "acc = \"start\"",
            "common": "//3E0B00"
          },
          {
            "offset": 51,
            "code": "sta v7",
            "pseudo": "v7 = acc",
            "common": "//6107"
          },
          {
            "offset": 53,
            "code": "lda v6",
            "pseudo": "acc = v6",
            "common": "//6006"
          },
          {
            "offset": 55,
            "code": "callthis1 3 v5 v7",
            "pseudo": "acc = v5.acc( v7 )",
            "common": "//2E030507"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 59,
        "asm": [
          {
            "offset": 59,
            "code": "lda v4",
            "pseudo": "acc = v4",
            "common": "//6004, 38:37"
          },
          {
            "offset": 61,
            "code": "less 5 arg0",
            "pseudo": "acc =  arg0 < acc",
            "common": "//11050B"
          },
          {
            "offset": 64,
            "code": "jeqz 129",
            "pseudo": "if (acc == 0) GOTO lable_193",
            "common": "//508100"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 193,
        "asm": [
          {
            "offset": 193,
            "code": "ldundefined ",
            "pseudo": "acc = UNDEFINED",
            "common": "//00"
          },
          {
            "offset": 194,
            "code": "returnundefined ",
            "pseudo": "return acc",
            "common": "//65"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 67,
        "asm": [
          {
            "offset": 67,
            "code": "lda v3",
            "pseudo": "acc = v3",
            "common": "//6003"
          },
          {
            "offset": 69,
            "code": "less 6 arg0",
            "pseudo": "acc =  arg0 < acc",
            "common": "//11060B"
          },
          {
            "offset": 72,
            "code": "jeqz 49",
            "pseudo": "if (acc == 0) GOTO lable_121",
            "common": "//4F31"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 121,
        "asm": [
          {
            "offset": 121,
            "code": "lda v1",
            "pseudo": "acc = v1",
            "common": "//6001, 49:50"
          },
          {
            "offset": 123,
            "code": "mod2 17 arg0",
            "pseudo": "acc =  arg0 % acc",
            "common": "//0E110B, 36:51"
          },
          {
            "offset": 126,
            "code": "sta v5",
            "pseudo": "v5 = acc",
            "common": "//6105"
          },
          {
            "offset": 128,
            "code": "lda v0",
            "pseudo": "acc = v0",
            "common": "//6000"
          },
          {
            "offset": 130,
            "code": "stricteq 18 v5",
            "pseudo": "acc = 18 === v5",
            "common": "//281205"
          },
          {
            "offset": 133,
            "code": "jnez -74",
            "pseudo": "if (acc != 0) GOTO lable_59",
            "common": "//51B6"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 74,
        "asm": [
          {
            "offset": 74,
            "code": "lda v2",
            "pseudo": "acc = v2",
            "common": "//6002"
          },
          {
            "offset": 76,
            "code": "eq 7 arg0",
            "pseudo": "acc =  arg0 == acc",
            "common": "//0F070B"
          },
          {
            "offset": 79,
            "code": "jeqz 9",
            "pseudo": "if (acc == 0) GOTO lable_88",
            "common": "//4F09"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 88,
        "asm": [
          {
            "offset": 88,
            "code": "mov v5 v0",
            "pseudo": "v5 = v0",
            "common": "//4405"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 81,
        "asm": [
          {
            "offset": 81,
            "code": "lda v1",
            "pseudo": "acc = v1",
            "common": "//6001"
          },
          {
            "offset": 83,
            "code": "add2 8 arg0",
            "pseudo": "acc =  arg0 + acc",
            "common": "//0A080B"
          },
          {
            "offset": 86,
            "code": "jmp 107",
            "pseudo": " GOTO lable_193",
            "common": "//4D6B"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 90,
        "asm": [
          {
            "offset": 90,
            "code": "lda v4",
            "pseudo": "acc = v4",
            "common": "//6004, 37:45"
          },
          {
            "offset": 92,
            "code": "less 9 v5",
            "pseudo": "acc =  v5 < acc",
            "common": "//110905"
          },
          {
            "offset": 95,
            "code": "jeqz -36",
            "pseudo": "if (acc == 0) GOTO lable_59",
            "common": "//4FDC"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 97,
        "asm": [
          {
            "offset": 97,
            "code": "tryldglobalbyname 10 \"console\"",
            "pseudo": "acc = _GLOBAL[\"console\"]",
            "common": "//3F0A0000"
          },
          {
            "offset": 101,
            "code": "sta v6",
            "pseudo": "v6 = acc",
            "common": "//6106"
          },
          {
            "offset": 103,
            "code": "ldobjbyname 11 \"log\"",
            "pseudo": "acc = acc[\"log\"]",
            "common": "//420B0400"
          },
          {
            "offset": 107,
            "code": "callthis1 13 v6 v5",
            "pseudo": "acc = v6.acc( v5 )",
            "common": "//2E0D0605, 36:39"
          },
          {
            "offset": 111,
            "code": "lda v5",
            "pseudo": "acc = v5",
            "common": "//6005"
          },
          {
            "offset": 113,
            "code": "tonumeric 15",
            "pseudo": "acc = to_numeric(acc)",
            "common": "//1E0F"
          },
          {
            "offset": 115,
            "code": "inc 16",
            "pseudo": "acc = acc + 1",
            "common": "//2110"
          },
          {
            "offset": 117,
            "code": "sta v5",
            "pseudo": "v5 = acc",
            "common": "//6105"
          },
          {
            "offset": 119,
            "code": "jmp -29",
            "pseudo": " GOTO lable_90",
            "common": "//4DE3"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 135,
        "asm": [
          {
            "offset": 135,
            "code": "mov v5 v0",
            "pseudo": "v5 = v0",
            "common": "//4405"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 137,
        "asm": [
          {
            "offset": 137,
            "code": "lda v4",
            "pseudo": "acc = v4",
            "common": "//6004, 51:0"
          },
          {
            "offset": 139,
            "code": "less 19 v5",
            "pseudo": "acc =  v5 < acc",
            "common": "//111305, 50:0"
          },
          {
            "offset": 142,
            "code": "jeqz 26",
            "pseudo": "if (acc == 0) GOTO lable_168",
            "common": "//4F1A"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 168,
        "asm": [
          {
            "offset": 168,
            "code": "tryldglobalbyname 27 \"console\"",
            "pseudo": "acc = _GLOBAL[\"console\"]",
            "common": "//3F1B0000"
          },
          {
            "offset": 172,
            "code": "sta v5",
            "pseudo": "v5 = acc",
            "common": "//6105"
          },
          {
            "offset": 174,
            "code": "ldobjbyname 28 \"log\"",
            "pseudo": "acc = acc[\"log\"]",
            "common": "//421C0400"
          },
          {
            "offset": 178,
            "code": "callthis1 30 v5 arg0",
            "pseudo": "acc = v5.acc( arg0 )",
            "common": "//2E1E050B"
          },
          {
            "offset": 182,
            "code": "lda arg0",
            "pseudo": "acc = arg0",
            "common": "//600B"
          },
          {
            "offset": 184,
            "code": "tonumeric 32",
            "pseudo": "acc = to_numeric(acc)",
            "common": "//1E20"
          },
          {
            "offset": 186,
            "code": "inc 33",
            "pseudo": "acc = acc + 1",
            "common": "//2121"
          },
          {
            "offset": 188,
            "code": "sta arg0",
            "pseudo": "arg0 = acc",
            "common": "//610B"
          },
          {
            "offset": 190,
            "code": "jmp -131",
            "pseudo": " GOTO lable_59",
            "common": "//4E7DFF"
          }
        ]
      }
    },
    {
      "node": {
        "offset": 144,
        "asm": [
          {
            "offset": 144,
            "code": "tryldglobalbyname 20 \"console\"",
            "pseudo": "acc = _GLOBAL[\"console\"]",
            "common": "//3F140000"
          },
          {
            "offset": 148,
            "code": "sta v6",
            "pseudo": "v6 = acc",
            "common": "//6106"
          },
          {
            "offset": 150,
            "code": "ldobjbyname 21 \"log\"",
            "pseudo": "acc = acc[\"log\"]",
            "common": "//42150400, 50:56"
          },
          {
            "offset": 154,
            "code": "callthis1 23 v6 v5",
            "pseudo": "acc = v6.acc( v5 )",
            "common": "//2E170605"
          },
          {
            "offset": 158,
            "code": "lda v5",
            "pseudo": "acc = v5",
            "common": "//6005"
          },
          {
            "offset": 160,
            "code": "tonumeric 25",
            "pseudo": "acc = to_numeric(acc)",
            "common": "//1E19"
          },
          {
            "offset": 162,
            "code": "inc 26",
            "pseudo": "acc = acc + 1",
            "common": "//211A"
          },
          {
            "offset": 164,
            "code": "sta v5",
            "pseudo": "v5 = acc",
            "common": "//6105"
          },
          {
            "offset": 166,
            "code": "jmp -29",
            "pseudo": " GOTO lable_137",
            "common": "//4DE3"
          }
        ]
      }
    }
  ],
  "edges": [
    {
      "source": "0",
      "target": "59",
      "value": true
    },
    {
      "source": "59",
      "target": "193",
      "value": false
    },
    {
      "source": "59",
      "target": "67",
      "value": true
    },
    {
      "source": "67",
      "target": "74",
      "value": true
    },
    {
      "source": "67",
      "target": "121",
      "value": false
    },
    {
      "source": "121",
      "target": "135",
      "value": true
    },
    {
      "source": "121",
      "target": "59",
      "value": false
    },
    {
      "source": "74",
      "target": "88",
      "value": false
    },
    {
      "source": "74",
      "target": "81",
      "value": true
    },
    {
      "source": "88",
      "target": "90",
      "value": true
    },
    {
      "source": "81",
      "target": "193",
      "value": true
    },
    {
      "source": "90",
      "target": "59",
      "value": false
    },
    {
      "source": "90",
      "target": "97",
      "value": true
    },
    {
      "source": "97",
      "target": "90",
      "value": true
    },
    {
      "source": "135",
      "target": "137",
      "value": true
    },
    {
      "source": "137",
      "target": "168",
      "value": false
    },
    {
      "source": "137",
      "target": "144",
      "value": true
    },
    {
      "source": "168",
      "target": "59",
      "value": true
    },
    {
      "source": "144",
      "target": "137",
      "value": true
    }
  ]
};
  
  // 引用容器元素
  const graphContainer = ref(null);
  
  // 绘制 CFG 图
  onMounted(() => {
    // 转换节点数据
    const nodes = cfgData.nodes.map((n) => ({
      id: n.node.offset.toString(), // 使用 offset 作为 id
      offset: n.node.offset,
      asm: n.node.asm,
      label: n.node.asm.map((a) => `${a.offset}: ${a.code} # ${a.pseudo}`) // 将 asm 内容逐行存储
    }));
  
    // 转换边数据：将 source 和 target 从字符串转换为节点对象
    const edges = cfgData.edges.map((e) => ({
      source: nodes.find((n) => n.id === e.source), // 找到对应的节点对象
      target: nodes.find((n) => n.id === e.target), // 找到对应的节点对象
      value: e.value,
    }));
  
    // 设置 SVG 容器的宽高
    const containerWidth = graphContainer.value.clientWidth; // 容器宽度
    const containerHeight = graphContainer.value.clientHeight; // 容器高度
  
    // 创建 SVG 元素
    const svg = d3
      .select(graphContainer.value)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`) // 初始 viewBox
      .attr("preserveAspectRatio", "xMidYMid meet"); // 保持内容居中
  
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
    const simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id((d) => d.id).distance(150) // 增加边距
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(containerWidth / 2, containerHeight / 2)) // 中心点设置为 SVG 的中心
      .force("collision", d3.forceCollide().radius((d) => Math.max(getNodeWidth(d), getNodeHeight(d)) / 2 + 25)); // 强制节点间隔 50px
  
    // 创建边
    const link = svg
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
    const node = svg
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
      .attr("stroke-width", 1);
  
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
  
    // 更新节点矩形的大小
    nodeRect
      .attr("width", (d) => getNodeWidth(d))
      .attr("height", (d) => getNodeHeight(d))
      .attr("x", (d) => -getNodeWidth(d) / 2)
      .attr("y", (d) => -getNodeHeight(d) / 2);
  
    // 计算节点宽度
    function getNodeWidth(d) {
      const maxLineLength = Math.max(...d.label.map((line) => line.length));
      return maxLineLength * 8 + 20; // 根据最长行长度动态计算宽度
    }
  
    // 计算节点高度
    function getNodeHeight(d) {
      return d.label.length * 20 + 20; // 根据行数动态计算高度
    }
  
    // 更新力导向图
    simulation.nodes(nodes).on("tick", () => {
      // 更新边的起点和终点，确保箭头指向节点边缘
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ratio = (dist - getNodeWidth(d.target) / 2) / dist; // 减去节点宽度的一半
          return d.source.x + dx * ratio;
        })
        .attr("y2", (d) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ratio = (dist - getNodeHeight(d.target) / 2) / dist; // 减去节点高度的一半
          return d.source.y + dy * ratio;
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
  
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
  
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
  
    // 在模拟结束后调整 SVG 的大小和滚动区域
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
  
      // 调整 SVG 的 viewBox 和大小
      const padding = 50; // 边距
      svg
        .attr("viewBox", `${graphBBox.x - padding} ${graphBBox.y - padding} ${graphBBox.width + 2 * padding} ${graphBBox.height + 2 * padding}`)
        .attr("width", graphBBox.width + 2 * padding)
        .attr("height", graphBBox.height + 2 * padding);
    });
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
    width: 100%; /* 根据需要调整宽度 */
    height: 100%; /* 根据需要调整高度 */
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #fff;
    overflow: auto; /* 启用滚动条 */
    display: flex;
    align-items: center; /* 水平居中 */
    justify-content: center; /* 垂直居中 */
  }
  </style>