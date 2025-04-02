d3.dsv(";", "data/data_ggsheet.csv").then(data => {
    const svgId = "#chart-Q11";
    d3.select(svgId).selectAll("*").remove();

    const purchaseCount = d3.rollups(data,
        v => new Set(v.map(d => d.ma_don_hang)).size,
        d => d.ma_khach_hang
    );

    const groupedData = d3.rollups(purchaseCount,
        v => v.length,
        d => d[1]
    ).map(([purchase, count]) => ({ purchase, count }))
     .sort((a, b) => a.purchase - b.purchase);

    const margin = { top: 50, right: 50, bottom: 50, left: 100 },
          width = 1200 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(groupedData.map(d => d.purchase))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.count)])
        .range([height, 0]);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("border", "1px solid black")
        .style("visibility", "hidden")
        .style("font-size", "14px")
        .style("text-align", "left");

    function showTooltip(event, d) {
        tooltip.style("visibility", "visible")
            .html(`<strong>Số lượt mua:</strong> ${d.purchase}<br>
                <strong>Số khách hàng:</strong> ${d3.format(",")(d.count)}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    }

    function hideTooltip() {
        tooltip.style("visibility", "hidden");
    }

    svg.selectAll(".bar")
        .data(groupedData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.purchase))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.count))
        .attr("fill", "#2c7bb7") 
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .style("font-family", "Calibri, sans-serif")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(",")))
        .style("font-family", "Calibri, sans-serif");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#246ba0") 
        .text("Phân phối Lượt mua hàng");



    d3.select("#insight11")
        .html(`
        Phần lớn khách hàng chỉ mua hàng 1-2 lần (hơn 4.500 khách hàng mua 1 lần, khoảng 1.200 khách hàng mua 2 lần), và số lần mua giảm mạnh khi số lần mua tăng lên, với rất ít khách hàng trung thành (mua từ 10 lần trở lên). Điều này chỉ ra hành vi mua sắm không thường xuyên và tỷ lệ giữ chân khách hàng thấp. <br>
        <br>
        Doanh nghiệp có thể cải thiện bằng cách tập trung vào chiến lược giữ chân khách hàng (như chương trình khách hàng thân thiết, ưu đãi) và nghiên cứu nhóm khách hàng trung thành để tăng tần suất mua hàng. <br>


    `);

}).catch(console.error);