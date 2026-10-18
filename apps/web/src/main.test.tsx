describe("main", () => {
  it("monta a App dentro de #root", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("./main.js");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.body.textContent).toContain("Decreto");
  });
});
