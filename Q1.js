d3.dsv(";", "data/data_ggsheet.csv").then(data => {     
    const svgId = "#chart-Q1";
    d3.select(svgId).selectAll("*").remove();

    data = data.map(d => ({
        name: `[${d.ma_mat_hang}] ${d.ten_mat_hang}`,
        category: `[${d.ma_nhom_hang}] ${d.ten_nhom_hang}`,
        revenue: +d.thanh_tien
    }));

    const revenueByItem = d3.rollups(data, v => d3.sum(v, d => d.revenue), d => d.name, d => d.category);
    const transformedData = revenueByItem.flatMap(([name, group]) =>
        group.map(([category, revenue]) => ({ name, category, revenue }))
    ).sort((a, b) => b.revenue - a.revenue);

    const margin = { top: 50, right: 400, bottom: 50, left: 350 },
          width = 1400 - margin.left - margin.right,
          height = transformedData.length * 30;

    const svg = d3.select(svgId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(transformedData, d => d.revenue) || 1])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(transformedData.map(d => d.name))
        .range([0, height])
        .padding(0.1);

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "5px 10px")
    .style("border", "1px solid #000")
    .style("border-radius", "5px")
    .style("visibility", "hidden")
    .style("font-size", "14px")
    .style("text-align", "left");


    svg.selectAll(".bar")
        .data(transformedData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.name))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d.revenue))
        .attr("fill", d => colorScale(d.category))
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                   .html(`<strong>Mặt hàng:</strong> ${d.name}<br>
                          <strong>Nhóm hàng:</strong> ${d.category}<br>
                          <strong>Doanh số bán:</strong> ${d3.format(",.0f")(d.revenue)}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    svg.selectAll(".label")
        .data(transformedData)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.revenue) + 5)
        .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .style("font-size", "14px")
        .style("font-family", "Calibri, sans-serif")
        .text(d => d3.format(",.0f")(d.revenue / 1_000_000) + " triệu VND");

    svg.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-family", "Calibri, sans-serif");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d3.format(",.0f")(d / 1_000_000) + "M"))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-family", "Calibri, sans-serif");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#246ba0") 
        .text("Doanh số bán hàng theo Mặt hàng");
        

    const categories = Array.from(new Set(transformedData.map(d => d.category)));

    const legend = svg.append("g").attr("transform", `translate(${width + 120},30)`);
    legend.append("text").attr("y", -10).text("Nhóm hàng")
        .style("font-size", "14px")
        .style("fill", "#246ba0") 
        .style("font-weight", "bold");

    legend.selectAll(".legend-item")
        .data(categories)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (_, i) => `translate(0, ${i * 20})`)
        .each(function(d) {
            d3.select(this).append("rect")
                .attr("width", 15).attr("height", 15)
                .attr("fill", colorScale(d));
            d3.select(this).append("text")
                .attr("x", 25).attr("y", 12)
                .style("font-size", "14px")
                .text(d);
        });
    

        d3.select("#insight1")
        .html(`1. Mặt hàng bán chạy nhất<br>
    Mã mặt hàng: BOT01<br>
    Tên mặt hàng: Bột cần tây<br>
    Doanh số bán: 626 triệu VND<br>
    <br>
    Bột cần tây là mặt hàng có doanh số cao nhất, có thể do nhu cầu thị trường đối với sản phẩm sức khỏe tăng cao. Bột cần tây được biết đến với công dụng giảm cân, thanh lọc cơ thể, phù hợp với xu hướng sống lành mạnh hiện nay.<br>
    Mặt hàng có doanh số đứng thứ hai là THO06 - Trà nhụy hoa nghệ tây với 592 triệu VND, một sản phẩm cao cấp thường được ưa chuộng nhờ tác dụng tốt cho sức khỏe và làn da.<br>
    <br>
    2. Mặt hàng bán kém nhất<br>
    Mã mặt hàng: SET06<br>
    Tên mặt hàng: Set 10 gói trà (một loại set trà cụ thể)<br>
    Doanh số bán: 32 triệu VND<br>
    <br>
    Sản phẩm có doanh số thấp nhất là SET06, chỉ đạt 32 triệu VND. Điều này có thể do các yếu tố như:<br>
    - Sản phẩm không phổ biến hoặc chưa được quảng bá rộng rãi.<br>
    - Không phù hợp với thị hiếu người tiêu dùng.<br>
    - Giá cao hoặc không có sự khác biệt so với các loại set trà khác.<br>
    <br>
    Nhận định chung<br>
    - Các sản phẩm Bột cần tây, Trà nhụy hoa nghệ tây, Trà hoa cúc, Trà gừng có doanh số cao do xu hướng sử dụng thực phẩm tốt cho sức khỏe.<br>
    - Các set trà (SET06, SET07, SET04, SET05) có doanh số thấp hơn, có thể do chúng không tạo được sự khác biệt hoặc không phù hợp với thị hiếu tiêu dùng hiện tại.<br>
    - Chiến lược marketing có thể cần điều chỉnh để tăng doanh số cho các mặt hàng bán kém, chẳng hạn như tạo combo khuyến mãi, thay đổi bao bì hoặc nhắm mục tiêu đến nhóm khách hàng phù hợp hơn.`);





}).catch(console.error);