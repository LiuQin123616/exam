import datetime
import time
import json
import os
from typing import Dict, Optional, List

class ExamCountdownAgent:
    """
    考试倒计时智能体
    帮助用户管理考试倒计时，提供友好的交互界面
    """
    
    def __init__(self):
        self.exams_file = "exams.json"
        self.exams = self.load_exams()
    
    def load_exams(self) -> List[Dict]:
        """从文件加载考试信息"""
        if os.path.exists(self.exams_file):
            with open(self.exams_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    
    def save_exams(self):
        """保存考试信息到文件"""
        with open(self.exams_file, 'w', encoding='utf-8') as f:
            json.dump(self.exams, f, ensure_ascii=False, indent=2)
    
    def add_exam(self, name: str, date_str: str, time_str: str = "09:00") -> bool:
        """
        添加新考试
        :param name: 考试名称
        :param date_str: 日期字符串，格式 YYYY-MM-DD
        :param time_str: 时间字符串，格式 HH:MM，默认为 09:00
        :return: 是否添加成功
        """
        try:
            exam_datetime = datetime.datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
            if exam_datetime <= datetime.datetime.now():
                print("错误：考试时间必须在未来！")
                return False
            
            self.exams.append({
                "name": name,
                "date": date_str,
                "time": time_str,
                "datetime": exam_datetime.isoformat()
            })
            self.save_exams()
            print(f"✓ 成功添加考试：{name}")
            return True
        except ValueError:
            print("错误：日期格式不正确，请使用 YYYY-MM-DD 格式")
            return False
    
    def remove_exam(self, index: int) -> bool:
        """
        删除指定索引的考试
        :param index: 考试索引（从1开始）
        :return: 是否删除成功
        """
        if 1 <= index <= len(self.exams):
            removed = self.exams.pop(index - 1)
            self.save_exams()
            print(f"✓ 已删除考试：{removed['name']}")
            return True
        print("错误：无效的考试索引")
        return False
    
    def list_exams(self):
        """列出所有考试及其倒计时"""
        if not self.exams:
            print("暂无考试记录")
            return
        
        print("\n" + "="*50)
        print(f"{'序号':<4} {'考试名称':<20} {'日期时间':<20} {'倒计时'}")
        print("="*50)
        
        now = datetime.datetime.now()
        for i, exam in enumerate(self.exams, 1):
            exam_datetime = datetime.datetime.fromisoformat(exam['datetime'])
            remaining = exam_datetime - now
            
            if remaining.total_seconds() <= 0:
                status = "已过期"
            else:
                days = remaining.days
                hours = remaining.seconds // 3600
                minutes = (remaining.seconds % 3600) // 60
                seconds = remaining.seconds % 60
                
                if days > 0:
                    status = f"{days}天 {hours}小时 {minutes}分钟"
                elif hours > 0:
                    status = f"{hours}小时 {minutes}分钟 {seconds}秒"
                elif minutes > 0:
                    status = f"{minutes}分钟 {seconds}秒"
                else:
                    status = f"{seconds}秒"
            
            print(f"{i:<4} {exam['name']:<20} {exam['date']} {exam['time']:<15} {status}")
        print("="*50 + "\n")
    
    def get_countdown(self, exam_name: str) -> Optional[str]:
        """
        获取指定考试的倒计时
        :param exam_name: 考试名称
        :return: 倒计时字符串或 None
        """
        now = datetime.datetime.now()
        for exam in self.exams:
            if exam['name'] == exam_name:
                exam_datetime = datetime.datetime.fromisoformat(exam['datetime'])
                remaining = exam_datetime - now
                
                if remaining.total_seconds() <= 0:
                    return "考试已过期"
                
                days = remaining.days
                hours = remaining.seconds // 3600
                minutes = (remaining.seconds % 3600) // 60
                seconds = remaining.seconds % 60
                
                parts = []
                if days > 0:
                    parts.append(f"{days}天")
                if hours > 0:
                    parts.append(f"{hours}小时")
                if minutes > 0:
                    parts.append(f"{minutes}分钟")
                if seconds > 0:
                    parts.append(f"{seconds}秒")
                
                return " ".join(parts)
        return None
    
    def start_live_countdown(self, exam_index: int):
        """
        启动实时倒计时
        :param exam_index: 考试索引（从1开始）
        """
        if not (1 <= exam_index <= len(self.exams)):
            print("错误：无效的考试索引")
            return
        
        exam = self.exams[exam_index - 1]
        exam_datetime = datetime.datetime.fromisoformat(exam['datetime'])
        
        print(f"\n🎯 {exam['name']} 实时倒计时")
        print("按 Ctrl+C 退出")
        print("-" * 40)
        
        try:
            while True:
                now = datetime.datetime.now()
                remaining = exam_datetime - now
                
                if remaining.total_seconds() <= 0:
                    print("\n🎉 考试时间到！")
                    break
                
                days = remaining.days
                hours = remaining.seconds // 3600
                minutes = (remaining.seconds % 3600) // 60
                seconds = remaining.seconds % 60
                
                countdown_str = f"{days:02d}天 {hours:02d}:{minutes:02d}:{seconds:02d}"
                print(f"\r{countdown_str}", end="")
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n倒计时已停止")
    
    def run(self):
        """启动智能体主循环"""
        print("="*50)
        print("🎓 考试倒计时智能体 v1.0")
        print("="*50)
        
        while True:
            print("\n请选择操作：")
            print("1. 添加考试")
            print("2. 删除考试")
            print("3. 查看所有考试")
            print("4. 实时倒计时")
            print("5. 退出")
            
            choice = input("\n输入选项编号：").strip()
            
            if choice == '1':
                name = input("请输入考试名称：").strip()
                date_str = input("请输入考试日期 (YYYY-MM-DD)：").strip()
                time_str = input("请输入考试时间 (HH:MM，默认 09:00)：").strip() or "09:00"
                self.add_exam(name, date_str, time_str)
            
            elif choice == '2':
                self.list_exams()
                if self.exams:
                    index = int(input("请输入要删除的考试序号：").strip())
                    self.remove_exam(index)
            
            elif choice == '3':
                self.list_exams()
            
            elif choice == '4':
                self.list_exams()
                if self.exams:
                    index = int(input("请输入要倒计时的考试序号：").strip())
                    self.start_live_countdown(index)
            
            elif choice == '5':
                print("👋 再见！")
                break
            
            else:
                print("❌ 无效选项，请重新输入")

if __name__ == "__main__":
    agent = ExamCountdownAgent()
    agent.run()