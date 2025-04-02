d3.dsv(";", "data/data_ggsheet.csv").then(data => {
    const svgId = "#chart-Q10";
    d3.select(svgId).selectAll("*").remove();

    data = data.map(d => ({
        category: `[${d.ma_nhom_hang}] ${d.ten_nhom_hang}`,
        item: `[${d.ma_mat_hang}] ${d.ten_mat_hang}`,
        month: `T${String(new Date(d.thoi_gian_tao_don).getMonth() + 1).padStart(2, '0')}`,
        order_id: d.ma_don_hang
    }));

    const totalOrdersByCategoryMonth = d3.rollups(
        data,
        v => new Set(v.map(d => d.order_id)).size,
        d => d.category,
        d => d.month
    );

    const groupedData = d3.rollups(
        data,
        v => new Set(v.map(d => d.order_id)).size,
        d => d.category,
        d => d.item,
        d => d.month
    );

    let transformedData = [];
    groupedData.forEach(([category, items]) => {
        items.forEach(([item, months]) => {
            months.forEach(([month, count]) => {
                const totalOrders = totalOrdersByCategoryMonth
                    .find(d => d[0] === category)?.[1]
                    .find(d => d[0] === month)?.[1] || 1;
                
                transformedData.push({ category, item, month, probability: count / totalOrders });
            });
        });
    });

    const monthList = [...new Set(transformedData.map(d => d.month))]
        .sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));
    
    const categories = [
        "[BOT] Bột", "[SET] Set trà", "[THO] Trà hoa",
        ...[...new Set(transformedData.map(d => d.category))]
            .filter(c => !["[BOT] Bột", "[SET] Set trà", "[THO] Trà hoa"].includes(c))
    ];

    const numCols = 3;
    const numRows = Math.ceil(categories.length / numCols);
    const margin = { top: 80, right: 50, bottom: 50, left: 100 };
    const width = 1800 - margin.left - margin.right;
    const heightPerChart = 250;
    const rowGap = 70;
    const colGap = 50;
    const totalHeight = numRows * heightPerChart + (numRows - 1) * rowGap;
    
    const svg = d3.select(svgId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", totalHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
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
            .html(`${d.month}<br>${d.item} ${d3.format(".1%")(d.probability)}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    }

    function hideTooltip() {
        tooltip.style("visibility", "hidden");
    }

    categories.forEach((category, index) => {
        const categoryData = transformedData.filter(d => d.category === category);
        const row = Math.floor(index / numCols);
        const col = index % numCols;
        const yOffset = row * (heightPerChart + rowGap);
        const xOffset = col * (1600 / numCols + colGap);
        
        const group = svg.append("g").attr("transform", `translate(${xOffset}, ${yOffset})`);
        
        const xScale = d3.scalePoint().domain(monthList).range([0, 500]);
        const yScale = d3.scaleLinear().domain([0, d3.max(categoryData, d => d.probability)]).range([heightPerChart, 0]);
        const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
        
        const line = d3.line()
            .x(d => xScale(d.month))
            .y(d => yScale(d.probability))
            .curve(d3.curveLinear);
        
        [...new Set(categoryData.map(d => d.item))].forEach(item => {
            const itemData = categoryData.filter(d => d.item === item);
            group.append("path")
                .datum(itemData)
                .attr("fill", "none")
                .attr("stroke", colorScale(item))
                .attr("stroke-width", 2)
                .attr("d", line);
            
            group.selectAll(`.dot-${item.replace(/[^a-zA-Z0-9-_]/g, "")}`)
                .data(itemData)
                .enter()
                .append("circle")
                .attr("class", `dot-${item.replace(/[^a-zA-Z0-9-_]/g, "")}`)
                .attr("cx", d => xScale(d.month))
                .attr("cy", d => yScale(d.probability))
                .attr("r", 5)
                .attr("fill", colorScale(item))
                .on("mouseover", showTooltip)
                .on("mouseout", hideTooltip);
        });
        
        group.append("text")
            .attr("x", 250)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("font-family", "Calibri, sans-serif")
            .text(category);
        
        group.append("g")
            .attr("transform", `translate(0,${heightPerChart})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text").style("font-size", "14px")
            .style("font-family", "Calibri, sans-serif");
        
        group.append("g")
            .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".0%")))
            .selectAll("text").style("font-size", "14px")
            .style("font-family", "Calibri, sans-serif");
    });
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#246ba0") 
        .text("Xác suất bán hàng của Mặt hàng theo Nhóm hàng theo từng Tháng");

    d3.select("#insight10")
        .html(`
        Nhóm "[SET] Set Trà" <br>
        Các sản phẩm trà hoa cúc, trà gừng và trà dưỡng nhan luôn có xác xuất bán cao và khá ổn định qua từng tháng.<br>
        Doanh nghiệp có thể tập trung đẩy mạnh bán các set trà vào các tháng cao điểm (T05, T09) và tìm cách kích cầu vào các tháng thấp điểm (T03, T11) bằng khuyến mãi hoặc chiến dịch marketing.<br>
            <br>
        Nhóm "[THO] Trà Hoa" <br>
        Các sản phẩm Trà hoa cúc, Trà hoa nhài và Trà hoa đậu biếc có xác suất bán cao và tăng đỉnh điểm vào khoảng Tháng 6 và Tháng 7, sự chênh lệch giữa các tháng là đáng kể. <br>
        Các sản phẩm Trà Hoa hồng, Trà nhụy hoa nghệ tây, Trà Atiso có xác suất bán rất thấp chỉ bằng 1 nửa so với các mặt hàng cùng nhóm khác, cho thấy các mặt hàng này có số lượt mua kém, nguyên nhân có thể đến từ hương vị, đóng gói,... <br>
            <br>
        Nhóm "[TMX] Trà Mix" <br>
        Xác suất bán hàng dao động từ khoảng 30% đến 45%. <br>
        Trà mix có tỷ lệ bán hàng khá ổn định và cao, doanh nghiệp nên duy trì chất lượng và có thể thử nghiệm các hương vị mới để giữ chân khách hàng. <br>
            <br>
        Nhóm "[TTC] Rau củ, quả sấy" <br>
        Sản phẩm Trà Cam lát duy trì xác suất bán tầm 40% còn Trà gừng duy trì ở mức 70% <br>
        Sản phẩm thuộc nhóm hàng này luôn duy trì xác suất bán đồng đều qua tất cả các tháng, đây là mặt hàng có tính ổn định cao qua các mùa. <br>
            <br>
        Tổng quan và Đề xuất: <br>
        Kết hợp bán chéo giữa các mặt hàng của các nhóm hàng khác nhau để kích thích nhu cầu tìm hiểu và thử nhiều loại sản phẩm tại cửa hàng, từ đó có thể tăng xác suất bán của một số mặt hàng đang có lượng bán không tốt.


    `);




}).catch(console.error);