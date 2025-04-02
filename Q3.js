d3.dsv(";", "data/data_ggsheet.csv").then(data => { 
    const svgId = "#chart-Q3";
    d3.select(svgId).selectAll("*").remove();

    data = data.map(d => ({
        month: `Tháng ${String(new Date(d.thoi_gian_tao_don).getMonth() + 1).padStart(2, '0')}`,
        revenue: +d.thanh_tien
    }));

    const revenueByMonth = d3.rollups(data, v => d3.sum(v, d => d.revenue), d => d.month)
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => a.month.localeCompare(b.month));

    const margin = { top: 50, right: 50, bottom: 50, left: 100 },
          width = 1200 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(revenueByMonth.map(d => d.month))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(revenueByMonth, d => d.revenue) || 1])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "5px 10px")
    .style("border", "1px solid #000")
    .style("border-radius", "5px")
    .style("visibility", "hidden")
    .style("text-align", "left");

    svg.selectAll(".bar")
        .data(revenueByMonth)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.month))
        .attr("y", d => yScale(d.revenue))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.revenue))
        .attr("fill", d => colorScale(d.month))
        .on("mouseover", (event, d) => tooltip.style("visibility", "visible")
            .html(`<strong>Tháng:</strong> ${d.month}<br>
                <strong>Doanh số:</strong> ${d3.format(",.0f")(d.revenue)}`))
        .on("mousemove", event => tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px"))
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    svg.selectAll(".label")
        .data(revenueByMonth)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.month) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.revenue) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "black")
        .text(d => d3.format(",.0f")(d.revenue / 1_000_000) + " triệu VND");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll("text").attr("dy", "10px")
        .style("font-family", "Calibri, sans-serif");

    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(7).tickFormat(d => d3.format(",.0f")(d / 1_000_000) + "M"))
        .style("font-family", "Calibri, sans-serif");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#246ba0") 
        .text("Doanh số bán hàng theo Tháng");

        d3.select("#insight3")
        .html(`1. Tháng có doanh số cao nhất<br>
    Tháng: 12<br>
    Doanh số bán: 750 triệu VND<br>
    <br>
    Tháng 12 là tháng có doanh số cao nhất trong năm (750 triệu VND). Một số lý do có thể dẫn đến kết quả này:<br>
    - Nhu cầu mua sắm dịp cuối năm, lễ Tết: Khách hàng thường mua trà, quà tặng và thực phẩm nhiều hơn để chuẩn bị cho Tết Dương lịch và Tết Nguyên đán.<br>
    - Các chương trình khuyến mãi lớn: Nhiều doanh nghiệp triển khai các chương trình giảm giá, combo quà tặng hấp dẫn vào dịp này.<br>
    - Tăng trưởng đơn hàng từ doanh nghiệp: Các công ty có thể đặt trà làm quà tặng khách hàng, đối tác dịp cuối năm.<br>
    <br>
    2. Tháng có doanh số thấp nhất<br>
    Tháng: 04<br>
    Doanh số bán: 196 triệu VND<br>
    <br>
    Tháng 4 có doanh số thấp nhất (196 triệu VND). Nguyên nhân có thể bao gồm:<br>
    - Không có dịp lễ lớn: Sau Tết Nguyên đán, nhu cầu tiêu dùng giảm xuống, đặc biệt là các mặt hàng không thiết yếu như trà và thực phẩm quà tặng.<br>
    - Khách hàng ưu tiên tiết kiệm: Sau kỳ nghỉ Tết và các đợt mua sắm đầu năm, nhiều người hạn chế chi tiêu, ảnh hưởng đến doanh số bán hàng.<br>
    <br>
    Nhận định chung<br>
    - Xu hướng doanh số tăng dần vào cuối năm, đặc biệt từ tháng 8 trở đi, cho thấy tác động mạnh mẽ của các dịp lễ và tâm lý tiêu dùng cuối năm.<br>
    - Các tháng đầu năm (từ tháng 1 đến tháng 4) có doanh số thấp, có thể do khách hàng đã chi tiêu nhiều vào dịp Tết và hạn chế mua sắm trong giai đoạn này.<br>
    - Giai đoạn từ tháng 8 trở đi (từ 520 triệu VND trở lên) là thời điểm quan trọng, cần tập trung vào marketing và tăng cường khuyến mãi để tận dụng sức mua cao của khách hàng.`);

}).catch(console.error);