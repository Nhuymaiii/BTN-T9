d3.dsv(";", "data/data_ggsheet.csv").then(data => { 
    const svgId = "#chart-Q2";
    d3.select(svgId).selectAll("*").remove();

    data = data.map(d => ({
        category: `[${d.ma_nhom_hang}] ${d.ten_nhom_hang}`,
        revenue: +d.thanh_tien
    }));

    const revenueByCategory = d3.rollup(data, v => d3.sum(v, d => d.revenue), d => d.category);
    const transformedData = Array.from(revenueByCategory, ([category, revenue]) => ({ category, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

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
        .domain(transformedData.map(d => d.category))
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
        .style("text-align", "left")
        .style("font-size", "14px");

    svg.selectAll(".bar")
        .data(transformedData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.category))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d.revenue))
        .attr("fill", d => colorScale(d.category))
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                   .html(`<strong>Nhóm hàng:</strong> ${d.category}<br>
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
        .attr("y", d => yScale(d.category) + yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .style("font-size", "14px")
        .style("font-family", "Calibri, sans-serif")
        .text(d => d3.format(",.0f")(d.revenue / 1_000_000) + " triệu VND");

    svg.append("g").call(d3.axisLeft(yScale))
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
        .text("Doanh số bán hàng theo Nhóm hàng");
    
        d3.select("#insight2")
        .html(`1. Nhóm hàng bán chạy nhất<br>
    Mã nhóm hàng: THO<br>
    Tên nhóm hàng: Trà hoa<br>
    Doanh số bán: 1,878 triệu VND<br>
    <br>
    Nhóm Trà hoa có doanh số cao nhất, đạt 1,878 triệu VND. Đây là nhóm sản phẩm chiếm ưu thế rõ rệt so với các nhóm khác. Một số lý do có thể dẫn đến kết quả này:<br>
    - Xu hướng sử dụng trà thảo mộc đang gia tăng do người tiêu dùng quan tâm đến sức khỏe và các sản phẩm tự nhiên.<br>
    - Các loại trà hoa như Trà nhụy hoa nghệ tây, Trà hoa cúc, Trà hoa Atiso rất phổ biến, phù hợp với nhiều đối tượng khách hàng từ người trẻ đến người lớn tuổi.<br>
    - Chất lượng và giá trị dinh dưỡng cao, giúp trà hoa được ưa chuộng hơn các nhóm hàng khác.<br>
    <br>
    2. Nhóm hàng bán kém nhất<br>
    Mã nhóm hàng: BOT<br>
    Tên nhóm hàng: Bột<br>
    Doanh số bán: 626 triệu VND<br>
    <br>
    Nhóm Bột có doanh số thấp nhất với 626 triệu VND. Nguyên nhân có thể bao gồm:<br>
    - Danh mục sản phẩm ít đa dạng, chủ yếu là Bột cần tây, có thể không đủ sức cạnh tranh với các loại trà phong phú hơn.<br>
    - Đối tượng khách hàng hẹp, tập trung vào nhóm quan tâm đến dinh dưỡng và giảm cân.<br>
    - Thiếu các sản phẩm bổ trợ như combo kết hợp, khuyến mãi hoặc đa dạng hóa hương vị.<br>
    <br>
    Nhận định chung<br>
    - Trà hoa chiếm ưu thế lớn, cho thấy nhu cầu của khách hàng đối với dòng sản phẩm này rất cao. Điều này có thể là cơ hội để mở rộng thêm các loại trà hoa mới hoặc nâng cao chất lượng sản phẩm hiện có.<br>
    - Nhóm Bột cần có chiến lược cải thiện, có thể bằng cách phát triển thêm các dòng sản phẩm khác ngoài Bột cần tây, chẳng hạn như bột matcha, bột nghệ hoặc bột cacao, để thu hút thêm khách hàng.<br>
    - Nhóm Set trà (778 triệu VND) và Trà củ, quả sấy (800 triệu VND) cũng có doanh số tương đối cao, cho thấy người tiêu dùng quan tâm đến sự tiện lợi và đa dạng khi chọn mua trà.`);


}).catch(console.error);