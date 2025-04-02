d3.dsv(";", "data/data_ggsheet.csv").then(data => {   
    const svgId = "#chart-Q12";
    d3.select(svgId).selectAll("*").remove();

    const spendingData = d3.rollups(
        data,
        v => d3.sum(v, d => +d.thanh_tien), 
        d => d.ma_khach_hang
    ).map(([customer, amount]) => ({ customer, amount }));

    const binWidth = 50000;
    const maxValue = d3.max(spendingData, d => d.amount) + binWidth;
    const bins = d3.range(0, maxValue, binWidth);

    const groupedData = d3.rollups(
        spendingData,
        v => v.length,
        d => bins.find(b => b > d.amount) - binWidth
    ).map(([range, count]) => ({ range, count })).sort((a, b) => a.range - b.range);

    const margin = { top: 50, right: 50, bottom: 50, left: 100 },
          width = 1200 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(groupedData.map(d => d.range))
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
            .html(`<strong>Mức chi trả: Từ </strong> ${d3.format(",")(d.range)} đến ${d3.format(",")(d.range + binWidth)}<br>
                   <strong>Số lượng khách hàng:</strong> ${d3.format(",")(d.count)}`)
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
        .attr("x", d => xScale(d.range))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.count))
        .attr("fill", "#2c7bb7") 
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(",")))
        .style("font-family", "Calibri, sans-serif")

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#246ba0") 
        .text("Phân phối Mức chi trả của Khách hàng");


    d3.select("#insight12")
        .html(`
        Phần lớn khách hàng chi tiêu thấp (khoảng 1.500 khách hàng dưới 50K, giảm dần đến dưới 100 khách hàng ở 500K), và rất ít khách hàng chi tiêu cao (dưới 50 khách hàng trên 1 triệu). <br>
        <br>
        Để tăng giá trị đơn hàng, doanh nghiệp có thể áp dụng chiến lược bán chéo (cross-selling) và bán thêm (up-selling), như gợi ý sản phẩm bổ sung hoặc khuyến mãi theo gói, nhằm khuyến khích khách hàng chi tiêu nhiều hơn. Đồng thời, nghiên cứu nhóm chi tiêu cao để thu hút thêm khách hàng tương tự.


    `);

}).catch(console.error);