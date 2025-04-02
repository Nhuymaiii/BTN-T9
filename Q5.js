d3.dsv(";", "data/data_ggsheet.csv").then(data => {
    const svgId = "#chart-Q5";
    d3.select(svgId).html("");

    const parseDate1 = d3.timeParse("%m/%d/%Y %H:%M"),
          parseDate2 = d3.timeParse("%d/%m/%Y %H:%M");

    data = data.map(d => {
        const date = parseDate1(d.thoi_gian_tao_don) || parseDate2(d.thoi_gian_tao_don);
        if (!date) return null;
        return {
            dateKey: date.toISOString().split("T")[0],
            dayOfMonth: `Ngày ${String(date.getDate()).padStart(2, '0')}`,
            revenue: +d.thanh_tien || 0
        };
    }).filter(d => d !== null);

    const totalByDate = d3.rollup(data, v => d3.sum(v, d => d.revenue), d => d.dateKey);
    const revenueByDay = new Map();

    totalByDate.forEach((sumRevenue, date) => {
        const dayLabel = `Ngày ${String(new Date(date).getDate()).padStart(2, '0')}`;
        if (!revenueByDay.has(dayLabel)) revenueByDay.set(dayLabel, []);
        revenueByDay.get(dayLabel).push(sumRevenue);
    });

    const revenueArray = Array.from(revenueByDay, ([day, values]) => ({
        day,
        avgRevenue: d3.mean(values) || 0
    })).sort((a, b) => a.day.localeCompare(b.day, 'vi', { numeric: true }));

    const margin = { top: 50, right: 50, bottom: 100, left: 100 },
          width = 1200 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand().domain(revenueArray.map(d => d.day)).range([0, width]).padding(0.1);
    const yScale = d3.scaleLinear().domain([0, d3.max(revenueArray, d => d.avgRevenue) || 1]).range([height, 0]);
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
            .html(`<strong>Ngày:</strong> ${d.day}<br>
                <strong>Doanh số TB:</strong> ${d3.format(",.0f")(d.avgRevenue)}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    }

    function hideTooltip() {
        tooltip.style("visibility", "hidden");
    }

    svg.selectAll(".bar")
        .data(revenueArray)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.day))
        .attr("y", d => yScale(d.avgRevenue))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.avgRevenue))
        .attr("fill", d => colorScale(d.day))
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    svg.selectAll(".label")
        .data(revenueArray)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.day) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.avgRevenue) - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "Calibri, sans-serif")
        .text(d => `${Math.round((d.avgRevenue / 1_000_000) * 10) / 10} tr`);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll("text")
        .attr("dy", "10px")
        .attr("dx", "-20px")
        .attr("transform", "rotate(-30)")
        .style("font-family", "Calibri, sans-serif");

    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => d === 0 ? "0" : `${d / 1e6}M`))
        .style("font-family", "Calibri, sans-serif");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#246ba0") 
        .text("Doanh số bán hàng trung bình theo Ngày trong tháng");


    d3.select("#insight5")
        .html(`Năm qua, ngày nào trong tháng thường bán chạy nhất? Ngày nào trong tháng thường bán kém nhất?<br>
    <br>
    Năm qua, ngày 17 là ngày bán chạy nhất với doanh thu trung bình 14,263,333 VNĐ (272 SKU). Điều này có thể lí giải rằng ngày 17 nằm giữa tháng, khi khách hàng vừa nhận lương và có tâm lý chi tiêu thoải mái.<br>
    Trong khi ngày 31 bán kém nhất với doanh thu trung bình 11,655,571 VNĐ (220 SKU), vì cuối tháng tài chính hạn chế, khách hàng tiết kiệm.<br>
    <br>
    Điều này cho thấy doanh số cao giữa tháng, thấp cuối tháng, với số lượng SKU và doanh thu tương quan, phản ánh giá trị SKU ổn định.<br>
    <br>
    Đề xuất:<br>
    - Tăng khuyến mãi vào ngày 15-20, đặc biệt ngày 17, với giảm giá hoặc sản phẩm mới.<br>
    - Kích cầu ngày 31 bằng flash sale, sản phẩm giá thấp.`);
}).catch(console.error);