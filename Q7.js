d3.dsv(";", "data/data_ggsheet.csv").then(data => {
    const svgId = "#chart-Q7";
    d3.select(svgId).selectAll("*").remove();

    const totalOrders = new Set(data.map(d => d.ma_don_hang)).size;
    const groupedData = d3.rollups(data, v => new Set(v.map(d => d.ma_don_hang)).size, d => `[${d.ma_nhom_hang}] ${d.ten_nhom_hang}`);
    
    const transformedData = groupedData.map(([nhom_hang, count]) => ({ nhom_hang, xac_suat_ban: count / totalOrders }))
        .sort((a, b) => b.xac_suat_ban - a.xac_suat_ban);

    const margin = { top: 50, right: 50, bottom: 50, left: 250 },
          width = 1200 - margin.left - margin.right,
          height = transformedData.length * 30;

    const svg = d3.select(svgId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, d3.max(transformedData, d => d.xac_suat_ban) || 1]).range([0, width]);
    const yScale = d3.scaleBand().domain(transformedData.map(d => d.nhom_hang)).range([0, height]).padding(0.2);
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("border", "1px solid black")
        .style("visibility", "hidden")
        .style("text-align", "left");

    function showTooltip(event, d) {
        tooltip.style("visibility", "visible")
            .html(`<strong>Nhóm hàng:</strong> ${d.nhom_hang}<br>
                <strong>Xác suất bán:</strong> ${d3.format(".1%")(d.xac_suat_ban)}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    }

    function hideTooltip() { tooltip.style("visibility", "hidden"); }

    svg.selectAll(".bar")
        .data(transformedData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.nhom_hang))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d.xac_suat_ban))
        .attr("fill", d => colorScale(d.nhom_hang))
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    svg.selectAll(".label")
        .data(transformedData)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.xac_suat_ban) + 5)
        .attr("y", d => yScale(d.nhom_hang) + yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .style("font-size", "12px")
        .style("font-family", "Calibri, sans-serif")
        .text(d => d3.format(".1%") (d.xac_suat_ban));

    svg.append("g").call(d3.axisLeft(yScale));
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(".0%")))
        .style("font-family", "Calibri, sans-serif");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#246ba0") 
        .text("Xác suất bán hàng theo Nhóm hàng");

        d3.select("#insight7")
        .html(`Năm qua, nhóm hàng nào thường dễ bán nhất (có xác suất bán trên mỗi đơn hàng cao nhất)? nhóm hàng nào khó bán nhất (có xác suất bán trên mỗi đơn hàng thấp nhất)?<br>
            <br>
    Năm qua, [TMX] Trà mix là nhóm hàng dễ bán nhất với xác suất bán 54.53%, nhờ tính phổ biến, giá hợp lý và phù hợp xu hướng sống lành mạnh. Trong khi [SET] Set trà khó bán nhất với xác suất 23.86%, do thuộc phân khúc ngách, giá cao và ít phù hợp nhu cầu hàng ngày. Insights cho thấy khách hàng ưa chuộng sản phẩm tiện lợi, giá rẻ như [TMX], còn [SET] chỉ phù hợp dịp lễ. <br>
    <br>
    Đề xuất: tăng quảng bá [TMX] Trà mix làm sản phẩm chủ lực, kết hợp bán chéo với [BOT] Bột; cải thiện [SET] Set trà bằng cách giảm giá, tập trung vào dịp lễ như Tết, Trung Thu, hoặc tạo combo với [TMX].
`);





}).catch(console.error);